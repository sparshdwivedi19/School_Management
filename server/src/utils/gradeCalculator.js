/**
 * CBSE Grading System (official)
 * A1: 91-100, A2: 81-90, B1: 71-80, B2: 61-70
 * C1: 51-60, C2: 41-50, D: 33-40, E: <33 (Fail)
 */

const CBSE_GRADES = [
  { min: 91, max: 100, grade: 'A1', gpa: 10.0, remark: 'Outstanding' },
  { min: 81, max: 90,  grade: 'A2', gpa: 9.0,  remark: 'Excellent'   },
  { min: 71, max: 80,  grade: 'B1', gpa: 8.0,  remark: 'Very Good'   },
  { min: 61, max: 70,  grade: 'B2', gpa: 7.0,  remark: 'Good'        },
  { min: 51, max: 60,  grade: 'C1', gpa: 6.0,  remark: 'Average'     },
  { min: 41, max: 50,  grade: 'C2', gpa: 5.0,  remark: 'Below Average'},
  { min: 33, max: 40,  grade: 'D',  gpa: 4.0,  remark: 'Needs Improvement' },
  { min: 0,  max: 32,  grade: 'E',  gpa: 0.0,  remark: 'Fail'        },
];

/**
 * Get CBSE grade for a given percentage
 * @param {number} percentage
 * @returns {{ grade, gpa, remark, isPassed }}
 */
const getGrade = (percentage) => {
  const pct = parseFloat(percentage) || 0;
  const entry = CBSE_GRADES.find((g) => pct >= g.min && pct <= g.max);
  const result = entry || CBSE_GRADES[CBSE_GRADES.length - 1];
  return {
    grade: result.grade,
    gpa: result.gpa,
    remark: result.remark,
    isPassed: pct >= 33,
  };
};

/**
 * Calculate percentage from marks obtained and max marks
 */
const calcPercentage = (obtained, maxMarks) => {
  if (!maxMarks || maxMarks === 0) return 0;
  return parseFloat(((obtained / maxMarks) * 100).toFixed(2));
};

/**
 * Compute aggregate result from array of subject marks
 * @param {Array} subjects - [{ marksObtained, maxMarks, isAbsent }]
 * @returns { totalObtained, totalMax, percentage, grade, gpa, remark, isPassed }
 */
const computeResult = (subjects) => {
  let totalObtained = 0;
  let totalMax = 0;

  subjects.forEach((s) => {
    if (!s.isAbsent) {
      totalObtained += Number(s.marksObtained) || 0;
    }
    totalMax += Number(s.maxMarks) || 0;
  });

  const percentage = calcPercentage(totalObtained, totalMax);
  const { grade, gpa, remark, isPassed } = getGrade(percentage);

  return { totalObtained, totalMax, percentage, grade, gpa, remark, isPassed };
};

/**
 * Get subject-wise grade for each subject
 */
const addSubjectGrades = (subjects) =>
  subjects.map((s) => {
    const pct = s.isAbsent ? 0 : calcPercentage(s.marksObtained, s.maxMarks);
    const { grade, isPassed } = getGrade(pct);
    return { ...s, grade, percentage: pct, isPassed };
  });

module.exports = { getGrade, calcPercentage, computeResult, addSubjectGrades, CBSE_GRADES };
