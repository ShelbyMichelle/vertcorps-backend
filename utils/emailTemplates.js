module.exports = {
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
