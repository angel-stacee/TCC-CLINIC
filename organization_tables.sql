CREATE TABLE IF NOT EXISTS `organization_categories` (
  `category` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `tagline` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `organization_members` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `credentials` VARCHAR(255) NULL,
  `level` INT NOT NULL DEFAULT 1,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `location` VARCHAR(255) NULL,
  `duty_hours` VARCHAR(100) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active Duty',
  `avatar_bg` VARCHAR(50) NOT NULL DEFAULT 'bg-[#70091f]',
  `badge_color` VARCHAR(255) NULL,
  `responsibilities` LONGTEXT NULL,
  `reports_to` VARCHAR(50) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_org_cat` (`category`),
  INDEX `idx_org_lvl` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `organization_categories` (`category`, `title`, `tagline`) VALUES
('clinic', 'Clinic Healthcare Team', 'Medical officers, clinical nurses, midwives, and healthcare specialists serving the TCC campus daily.'),
('admin', 'College Administration & Health Services', 'Executive leadership guiding health governance, institutional accreditation, and campus student welfare.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `organization_members` (`id`, `category`, `name`, `role`, `department`, `credentials`, `level`, `email`, `phone`, `location`, `duty_hours`, `status`, `avatar_bg`, `badge_color`, `responsibilities`, `reports_to`, `sort_order`) VALUES
('c-1', 'clinic', 'Dr. Maria Elena Ramos, MD', 'College Medical Officer / Head Physician', 'Health Services & Diagnostics', 'Doctor of Medicine (MD) · Board Certified', 1, 'dr.ramos@tcc.edu.ph', '+63 (088) 555-0101', 'Baluarte Campus Clinic · Room 101', 'Mon - Thu · 8:00 AM - 5:00 PM', 'In Clinic', 'bg-[#70091f]', 'bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30', '["Directs campus health policy and patient diagnosis","Conducts routine student & faculty clinical evaluations","Supervises prescription dispensations and emergency protocols"]', NULL, 1),
('c-2', 'clinic', 'Angel Santos, RN, MAN', 'Head Nurse & Clinic Coordinator', 'Nursing & Clinic Operations', 'BS Nursing · Master of Arts in Nursing (MAN)', 2, 'angel.santos@tcc.edu.ph', '+63 (088) 555-0102', 'Baluarte Campus Clinic · Triage Station', 'Mon - Fri · 7:30 AM - 4:30 PM', 'Active Duty', 'bg-[#8b1505]', 'bg-emerald-50 text-emerald-700 border-emerald-200', '["Coordinates day-to-day clinic visits and patient intake","Manages student vital signs and immunization tracking","Supervises junior staff nurses and clinical interns"]', 'c-1', 2),
('c-3', 'clinic', 'Carmela Bautista, RN', 'Staff Nurse (Primary Care & Triage)', 'Primary Healthcare Unit', 'BS Nursing · Registered Nurse (RN)', 3, 'carmela.bautista@tcc.edu.ph', '+63 (088) 555-0103', 'Baluarte Campus Clinic · Bed Ward 1', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Active Duty', 'bg-[#5c0819]', 'bg-blue-50 text-blue-700 border-blue-200', '["First aid treatment and wound dressing","Patient vital signs recording and consultation logs","Assisting physician in student physical examinations"]', 'c-2', 3),
('c-4', 'clinic', 'Jocelyn Dela Cruz, RM, RN', 'Staff Midwife & Maternal Health Specialist', 'Maternal & Reproductive Healthcare', 'Registered Midwife (RM) · Registered Nurse (RN)', 3, 'jocelyn.delacruz@tcc.edu.ph', '+63 (088) 555-0104', 'Baluarte Campus Clinic · Examination Room', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Active Duty', 'bg-[#a31a08]', 'bg-purple-50 text-purple-700 border-purple-200', '["Maternal and reproductive health counseling","Fetal Doppler monitoring and routine vitals assessment","Women''s health wellness education seminars"]', 'c-2', 4),
('c-5', 'clinic', 'Mark Anthony Dizon, RN', 'Emergency & First Aid Nurse', 'Emergency Response & Triage', 'BS Nursing · BLS / ACLS Certified', 3, 'mark.dizon@tcc.edu.ph', '+63 (088) 555-0105', 'Baluarte Campus Clinic · Emergency Bay', 'Mon - Fri · 8:00 AM - 5:00 PM', 'On Call', 'bg-[#70091f]', 'bg-amber-50 text-amber-700 border-amber-200', '["Emergency trauma response on campus grounds","Maintenance of emergency kit, oxygen, and stretchers","CPR and emergency medical transport coordination"]', 'c-2', 5),
('c-6', 'clinic', 'Kristine Mae Perez, RPh', 'Clinic Pharmacist & Dispensary Custodian', 'Pharmacy & Medicine Inventory', 'BS Pharmacy · Registered Pharmacist (RPh)', 4, 'kristine.perez@tcc.edu.ph', '+63 (088) 555-0106', 'Baluarte Campus Clinic · Pharmacy Room', 'Mon - Fri · 8:30 AM - 4:30 PM', 'Active Duty', 'bg-[#480613]', 'bg-emerald-50 text-emerald-700 border-emerald-200', '["Medicine stock tracking, expiration audits & re-ordering","Safe prescription dispensing and dosage instructions","Inventory logging on the digital clinic management system"]', 'c-2', 6),
('c-7', 'clinic', 'Ryan Paul Villanueva', 'Medical Records Officer & Health Data Custodian', 'Health Records & Statistics', 'BS Information Technology · Health Records Specialist', 4, 'ryan.villanueva@tcc.edu.ph', '+63 (088) 555-0107', 'Baluarte Campus Clinic · Archive Section', 'Mon - Fri · 8:00 AM - 5:00 PM', 'In Clinic', 'bg-[#2e030c]', 'bg-stone-50 text-stone-700 border-stone-200', '["Maintenance of student digital and physical health folders","Processing medical certificates and clearance documents","Generation of monthly health statistics and clinic analytics"]', 'c-2', 7),
('a-1', 'admin', 'Dr. Lincoln V. Tan, EdD', 'College President', 'Office of the President', 'Doctor of Education (EdD) · Institutional Head', 1, 'president@tcc.edu.ph', '+63 (088) 555-0001', 'TCC Administration Building · Executive Suite', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Administrative', 'bg-[#70091f]', 'bg-[#70091f]/10 text-[#70091f] border-[#70091f]/30', '["Institutional direction and educational governance","Sanctioning campus health & safety operational budgets","Liaison with municipal government and healthcare partners"]', NULL, 1),
('a-2', 'admin', 'Dr. Rebecca S. Reyes, PhD', 'Vice President for Academic Affairs', 'Academic Affairs Directorate', 'PhD in Educational Leadership · ALCUCOA Lead Evaluator', 2, 'vpaa@tcc.edu.ph', '+63 (088) 555-0002', 'TCC Administration Building · 2nd Floor', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Administrative', 'bg-[#8b1505]', 'bg-blue-50 text-blue-700 border-blue-200', '["Academic integration of campus healthcare programs","Institutional medical requirements for enrolled students","Faculty wellness and health development programs"]', 'a-1', 2),
('a-3', 'admin', 'Prof. Rowena G. Alcantara, RN, MN', 'Dean, College of Nursing & Midwifery', 'College of Nursing & Health Sciences', 'BS Nursing · Master of Nursing (MN)', 3, 'dean.nursing@tcc.edu.ph', '+63 (088) 555-0003', 'Health Sciences Building · Dean''s Office', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Active Duty', 'bg-[#5c0819]', 'bg-emerald-50 text-emerald-700 border-emerald-200', '["Supervision of nursing & midwifery clinical affiliations","Clinical curriculum and competency standards","Collaboration between academic department & campus clinic"]', 'a-2', 3),
('a-4', 'admin', 'Prof. Edgardo M. Morales, MAEd', 'Dean of Student Affairs & Services', 'Student Affairs and Services (SAS)', 'MA in Educational Management', 3, 'osas@tcc.edu.ph', '+63 (088) 555-0004', 'Student Center · Room 204', 'Mon - Fri · 8:00 AM - 5:00 PM', 'Administrative', 'bg-[#480613]', 'bg-amber-50 text-amber-700 border-amber-200', '["Student welfare and emergency crisis assistance","Campus-wide annual medical and dental checkup drives","Coordination of medical clearance for collegiate athletes"]', 'a-1', 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `role` = VALUES(`role`), `updated_at` = NOW();
