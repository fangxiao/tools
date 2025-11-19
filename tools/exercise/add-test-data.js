// Script to add test data to the database
const { db, initializeDatabase } = require('../../database');

// Initialize the database first
initializeDatabase();

// Add test exercise goals and records
function addTestData() {
    // Wait a moment for database initialization
    setTimeout(() => {
        // Test user ID (assuming user with ID 1 exists)
        const userId = 1;
        
        // Add test goals
        const goals = [
            {
                userId: userId,
                title: '11月跑步目标',
                target: 50,
                period: 'monthly',
                startDate: '2025-11-01',
                endDate: '2025-11-30'
            },
            {
                userId: userId,
                title: '每周健身目标',
                target: 15,
                period: 'weekly',
                startDate: '2025-11-02',
                endDate: '2025-11-08'
            }
        ];
        
        // Add test records
        const records = [
            {
                userId: userId,
                goalId: 1,
                exerciseType: 'running',
                value: 5.5,
                recordDate: '2025-11-04',
                note: '晨跑'
            },
            {
                userId: userId,
                goalId: 1,
                exerciseType: 'walking',
                value: 3.2,
                recordDate: '2025-11-04',
                note: '上班路上'
            },
            {
                userId: userId,
                goalId: 2,
                exerciseType: 'weight_lifting',
                value: 1.5,
                recordDate: '2025-11-03',
                note: '健身房训练'
            }
        ];
        
        // Insert goals
        goals.forEach(goal => {
            const sql = `INSERT OR IGNORE INTO exercise_goals 
                (user_id, title, target, period, start_date, end_date, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const createdAt = new Date().toISOString();
            db.run(sql, [
                goal.userId,
                goal.title,
                goal.target,
                goal.period,
                goal.startDate,
                goal.endDate,
                createdAt
            ], (err) => {
                if (err) {
                    console.error('Error inserting goal:', err.message);
                } else {
                    console.log('Goal inserted successfully');
                }
            });
        });
        
        // Insert records (with a delay to ensure goals are inserted first)
        setTimeout(() => {
            records.forEach(record => {
                const sql = `INSERT OR IGNORE INTO exercise_records 
                    (user_id, goal_id, exercise_type, value, record_date, note, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
                const createdAt = new Date().toISOString();
                db.run(sql, [
                    record.userId,
                    record.goalId,
                    record.exerciseType,
                    record.value,
                    record.recordDate,
                    record.note || null,
                    createdAt
                ], (err) => {
                    if (err) {
                        console.error('Error inserting record:', err.message);
                    } else {
                        console.log('Record inserted successfully');
                    }
                });
            });
        }, 1000);
    }, 2000);
}

// Run the function
addTestData();

console.log('Test data insertion initiated. Please wait a moment for completion.');