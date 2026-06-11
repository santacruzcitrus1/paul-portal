import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantName, unitAddress, issueTitle, issueDescription, location, severity, photoUrls } = body

    if (!tenantName || !unitAddress || !issueTitle || !issueDescription || !location || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to Supabase
    const { data: ticket, error: dbError } = await supabaseAdmin
      .from('work_orders')
      .insert({
        tenant_name: tenantName,
        unit_address: unitAddress,
        issue_title: issueTitle,
        issue_description: issueDescription,
        location_in_property: location,
        severity,
        photo_urls: photoUrls || [],
        status: 'open',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get notification recipients
    const { data: recipients } = await supabaseAdmin
      .from('notification_recipients')
      .select('*')
      .eq('active', true)

    const severityEmojis: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }
    const severityEmoji = severityEmojis[severity] || '⚪'

    const emailHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #1d4ed8; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">New Maintenance Request ${severityEmoji}</h1>
        </div>
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Tenant</td><td style="padding: 8px 0; font-weight: 600;">${tenantName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Property</td><td style="padding: 8px 0; font-weight: 600;">${unitAddress}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Issue</td><td style="padding: 8px 0; font-weight: 600;">${issueTitle}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Location</td><td style="padding: 8px 0;">${location}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Severity</td><td style="padding: 8px 0;">${severityEmoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Description</p>
            <p style="margin: 0;">${issueDescription}</p>
          </div>
          ${photoUrls && photoUrls.length > 0 ? `
          <div style="margin-top: 16px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${photoUrls.length} photo(s) attached</p>
            ${photoUrls.map((url: string) => `<img src="${url}" style="max-width: 100%; border-radius: 8px; margin-bottom: 8px;" />`).join('')}
          </div>` : ''}
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://emberseo.ai'}/paul-portal/dashboard" 
               style="background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `

    // Send emails
    if (recipients && recipients.length > 0) {
      for (const recipient of recipients) {
        if (recipient.email) {
          await resend.emails.send({
            from: 'Paul Portal <notifications@emberseo.ai>',
            to: recipient.email,
            subject: `${severityEmoji} New Work Order: ${issueTitle} — ${unitAddress}`,
            html: emailHtml,
          })
        }

        // SMS via Twilio (placeholder — wire in when credentials arrive)
        if (recipient.phone && process.env.TWILIO_ACCOUNT_SID !== 'PLACEHOLDER') {
          try {
            const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
            await twilio.messages.create({
              body: `${severityEmoji} New work order: ${issueTitle} at ${unitAddress} from ${tenantName}. Severity: ${severity}. Check your email or dashboard for details.`,
              from: process.env.TWILIO_FROM_NUMBER,
              to: recipient.phone,
            })
          } catch (smsErr) {
            console.error('SMS error:', smsErr)
          }
        }
      }
    }

    return NextResponse.json({ success: true, id: ticket.id })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
