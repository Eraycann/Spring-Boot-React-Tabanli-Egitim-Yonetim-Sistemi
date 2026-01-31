-- Clean up duplicate exam submissions
-- Keep only the most recent submission for each student-exam combination

-- First, identify and delete duplicate submissions keeping the one with the latest ID
DELETE FROM exam_submissions 
WHERE id NOT IN (
    SELECT MAX(id) 
    FROM exam_submissions 
    GROUP BY exam_id, student_id
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE exam_submissions 
ADD CONSTRAINT uk_exam_submission_exam_student 
UNIQUE (exam_id, student_id);
