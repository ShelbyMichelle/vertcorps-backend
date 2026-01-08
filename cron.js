const cron = require("node-cron");
const sendMail = require("./config/mailer");

cron.schedule("0 0 * * *", async () => {
    const overdue = await db.query(`
        SELECT * FROM esmp_records
        WHERE status='Under Review'
        AND DATEDIFF(NOW(), review_started_at) > 5
    `);

    for (const item of overdue) {
        await sendMail({
            to: item.reviewer_email,
            subject: `Reminder: ESMP Review Overdue`,
            html: `
                <h3>Pending review: ${item.project_name}</h3>
                <p>This ESMP has been awaiting review for more than 5 days.</p>
            `
        });
    }
});
