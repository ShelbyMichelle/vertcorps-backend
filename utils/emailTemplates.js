module.exports = {
    notificationEmail: (title, message, portalLink = '') => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
            <div style="background: linear-gradient(to right, #15803d, #16a34a); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">${title}</h2>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
                <p style="line-height: 1.6;">${message}</p>
                ${portalLink ? `<p style="margin-top: 20px;"><a href="${portalLink}" style="background: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Portal</a></p>` : ''}
            </div>
            <div style="padding: 20px; background: #e5e7eb; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                <p style="margin: 0;">This is an automated notification from ESMP Portal. Please do not reply to this email.</p>
            </div>
        </div>
    `,
    esmpSubmitted: (record) => `
        <h3>New ESMP Submission</h3>
        <p><strong>Project:</strong> ${record.project_name}</p>
        <p><strong>Company:</strong> ${record.company}</p>

        <p>The ESMP has been submitted and is awaiting your review.</p>
        <p>
            <a href="https://your-esmp-portal.com/esmp/${record.id}">
                Open ESMP Portal
            </a>
        </p>
    `,

    commentsIssued: (record) => `
        <h3>Reviewer Comments</h3>
        <p>Comments have been issued for your submission:</p>
        <p><strong>${record.project_name}</strong></p>

        <p>Please sign in to review and resubmit.</p>
        <p>
            <a href="https://your-esmp-portal.com/esmp/${record.id}">
                View Comments
            </a>
        </p>
    `,

    esmpApproved: (record) => `
        <h3>Congratulations!</h3>
        <p>Your ESMP has been approved.</p>
        <p><strong>${record.project_name}</strong></p>

        <p>You may now proceed to the implementation stage.</p>
    `,

    esmpRejected: (record) => `
        <h3>ESMP Not Approved</h3>
        <p>After review, your ESMP has been rejected.</p>
        <p><strong>${record.project_name}</strong></p>
        <p>Please resubmit with corrections.</p>
    `,
};
