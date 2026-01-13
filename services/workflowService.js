const db = require("../database");     // your pool or ORM
const sendMail = require("../config/mailer");
const templates = require("../utils/emailTemplates");

const STATUS = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    COMMENTS: "Comments Issued",
    RESUBMITTED: "Resubmitted",
    APPROVED: "Approved",
    REJECTED: "Rejected",
};

async function updateStatus(id, newStatus) {
    // Get record
    const [record] = await db.query(`SELECT * FROM esmp_records WHERE id=?`, [id]);

    if (!record) throw new Error("Record not found");

    const timestampField = {
        "Submitted": "submitted_at",
        "Under Review": "review_started_at",
        "Comments Issued": "comments_issued_at",
        "Resubmitted": "resubmitted_at",
        "Approved": "approved_at",
        "Rejected": "approved_at", // or separate rejected_at
    }[newStatus];

    // Update status + timestamp
    await db.query(`
        UPDATE esmp_records
        SET status=?, ${timestampField}=NOW()
        WHERE id=?
    `, [newStatus, id]);

    // Select email target
    switch (newStatus) {
        case STATUS.SUBMITTED:
            await sendMail({
                to: record.reviewer_email,
                subject: `New ESMP Submitted: ${record.project_name}`,
                html: templates.esmpSubmitted(record),
            });
            break;

        case STATUS.COMMENTS:
            await sendMail({
                to: record.company_email,
                subject: `ESMP Reviewer Comments`,
                html: templates.commentsIssued(record),
            });
            break;

        case STATUS.APPROVED:
            await sendMail({
                to: record.company_email,
                subject: `ESMP Approved 🎉`,
                html: templates.esmpApproved(record),
            });
            break;

        case STATUS.REJECTED:
            await sendMail({
                to: record.company_email,
                subject: `ESMP Rejected`,
                html: templates.esmpRejected(record),
            });
            break;
    }

    return { success: true };
}

module.exports = { updateStatus, STATUS };
