import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ChevronDown, ChevronUp, BookOpen, Award, GraduationCap } from 'lucide-react';

const CSE_CORE_SEMESTERS = [
    {
        semester: 1,
        credits: 22,
        focus: "Foundation in Mathematics, Physics, and Programming Fundamentals",
        subjects: [
            { code: "MAT101", name: "Engineering Mathematics I", credits: 4 },
            { code: "PHY101", name: "Engineering Physics", credits: 4 },
            { code: "CSE101", name: "Introduction to Programming", credits: 4 },
            { code: "ENG101", name: "Technical Communication", credits: 3 },
            { code: "CHE101", name: "Engineering Chemistry", credits: 4 },
            { code: "PHY102", name: "Physics Lab", credits: 1 },
            { code: "CSE102", name: "Programming Lab", credits: 2 }
        ]
    },
    {
        semester: 2,
        credits: 23,
        focus: "Data Structures, Digital Logic, and Advanced Mathematics",
        subjects: [
            { code: "MAT201", name: "Engineering Mathematics II", credits: 4 },
            { code: "CSE201", name: "Data Structures", credits: 4 },
            { code: "ECE201", name: "Digital Logic Design", credits: 4 },
            { code: "CSE202", name: "Object-Oriented Programming", credits: 4 },
            { code: "ENG201", name: "Professional Ethics", credits: 2 },
            { code: "CSE203", name: "Data Structures Lab", credits: 2 },
            { code: "ECE202", name: "Digital Logic Lab", credits: 2 },
            { code: "PHY201", name: "Environmental Science", credits: 1 }
        ]
    },
    {
        semester: 3,
        credits: 24,
        focus: "Core Computer Science: Algorithms, OS, and Computer Architecture",
        subjects: [
            { code: "MAT301", name: "Discrete Mathematics", credits: 4 },
            { code: "CSE301", name: "Design and Analysis of Algorithms", credits: 4 },
            { code: "CSE302", name: "Data Communication & Networking", credits: 4 },
            { code: "CSE303", name: "Computer Organization & Architecture", credits: 4 },
            { code: "CSE304", name: "Database Management Systems", credits: 4 },
            { code: "CSE305", name: "Algorithms Lab", credits: 2 },
            { code: "CSE306", name: "DBMS Lab", credits: 2 }
        ]
    },
    {
        semester: 4,
        credits: 23,
        focus: "Operating Systems, Software Engineering, and Web Technologies",
        subjects: [
            { code: "CSE401", name: "Operating Systems", credits: 4 },
            { code: "CSE402", name: "Software Engineering", credits: 4 },
            { code: "CSE403", name: "Theory of Computation", credits: 4 },
            { code: "CSE404", name: "Web Technologies", credits: 3 },
            { code: "CSE405", name: "Microprocessors & Microcontrollers", credits: 4 },
            { code: "CSE406", name: "OS Lab", credits: 2 },
            { code: "CSE407", name: "Web Technologies Lab", credits: 2 }
        ]
    },
    {
        semester: 5,
        credits: 22,
        focus: "Compiler Design, AI/ML Fundamentals, and Elective Specialization",
        subjects: [
            { code: "CSE501", name: "Compiler Design", credits: 4 },
            { code: "CSE502", name: "Artificial Intelligence", credits: 4 },
            { code: "CSE503", name: "Computer Networks", credits: 4 },
            { code: "CSE5XX", name: "Professional Elective I", credits: 3 },
            { code: "CSE5YY", name: "Professional Elective II", credits: 3 },
            { code: "CSE504", name: "AI Lab", credits: 2 },
            { code: "CSE505", name: "Mini Project", credits: 2 }
        ]
    },
    {
        semester: 6,
        credits: 21,
        focus: "Machine Learning, Cloud Computing, and Advanced Electives",
        subjects: [
            { code: "CSE601", name: "Machine Learning", credits: 4 },
            { code: "CSE602", name: "Cloud Computing", credits: 4 },
            { code: "CSE603", name: "Information Security", credits: 4 },
            { code: "CSE6XX", name: "Professional Elective III", credits: 3 },
            { code: "CSE6YY", name: "Professional Elective IV", credits: 3 },
            { code: "CSE604", name: "ML Lab", credits: 2 },
            { code: "INT601", name: "Summer Internship", credits: 1 }
        ]
    },
    {
        semester: 7,
        credits: 20,
        focus: "Specialization Deepening and Major Project Phase I",
        subjects: [
            { code: "CSE701", name: "Big Data Analytics", credits: 4 },
            { code: "CSE7XX", name: "Professional Elective V", credits: 3 },
            { code: "CSE7YY", name: "Professional Elective VI", credits: 3 },
            { code: "CSE7ZZ", name: "Open Elective I", credits: 3 },
            { code: "CSE702", name: "Major Project Phase I", credits: 4 },
            { code: "CSE703", name: "Seminar & Technical Writing", credits: 2 },
            { code: "MGT701", name: "Entrepreneurship Development", credits: 1 }
        ]
    },
    {
        semester: 8,
        credits: 18,
        focus: "Capstone Project, Industry Readiness, and Open Electives",
        subjects: [
            { code: "CSE801", name: "Major Project Phase II", credits: 8 },
            { code: "CSE8XX", name: "Professional Elective VII", credits: 3 },
            { code: "CSE8YY", name: "Open Elective II", credits: 3 },
            { code: "CSE802", name: "Industry Internship / Research Project", credits: 4 }
        ]
    }
];

const PROGRAMS = [
    {
        id: 'cse-core',
        name: 'B.Tech CSE (Core)',
        description: 'Standard Computer Science & Engineering curriculum with broad foundation',
        semesters: CSE_CORE_SEMESTERS,
        totalCredits: 173
    },
    {
        id: 'cse-aiml',
        name: 'B.Tech CSE (AI & ML)',
        description: 'Specialization in Artificial Intelligence and Machine Learning',
        semesters: CSE_CORE_SEMESTERS.map((sem, idx) => {
            if (idx >= 4) { // Semesters 5-8
                return {
                    ...sem,
                    subjects: sem.subjects.map(sub => {
                        if (sub.code.includes('XX') || sub.code.includes('YY')) {
                            return { ...sub, name: sub.name.replace('Professional Elective', 'AI/ML Elective') };
                        }
                        return sub;
                    })
                };
            }
            return sem;
        }),
        totalCredits: 173
    },
    {
        id: 'cse-ds',
        name: 'B.Tech CSE (Data Science)',
        description: 'Focus on Big Data, Analytics, and Statistical Computing',
        semesters: CSE_CORE_SEMESTERS.map((sem, idx) => {
            if (idx >= 4) {
                return {
                    ...sem,
                    subjects: sem.subjects.map(sub => {
                        if (sub.code.includes('XX') || sub.code.includes('YY')) {
                            return { ...sub, name: sub.name.replace('Professional Elective', 'Data Science Elective') };
                        }
                        return sub;
                    })
                };
            }
            return sem;
        }),
        totalCredits: 173
    },
    {
        id: 'cse-cyber',
        name: 'B.Tech CSE (Cybersecurity)',
        description: 'Specialization in Network Security and Ethical Hacking',
        semesters: CSE_CORE_SEMESTERS.map((sem, idx) => {
            if (idx >= 4) {
                return {
                    ...sem,
                    subjects: sem.subjects.map(sub => {
                        if (sub.code.includes('XX') || sub.code.includes('YY')) {
                            return { ...sub, name: sub.name.replace('Professional Elective', 'Cybersecurity Elective') };
                        }
                        return sub;
                    })
                };
            }
            return sem;
        }),
        totalCredits: 173
    },
    {
        id: 'cse-cloud',
        name: 'B.Tech CSE (Cloud Computing)',
        description: 'Cloud Architecture, DevOps, and Distributed Systems',
        semesters: CSE_CORE_SEMESTERS.map((sem, idx) => {
            if (idx >= 4) {
                return {
                    ...sem,
                    subjects: sem.subjects.map(sub => {
                        if (sub.code.includes('XX') || sub.code.includes('YY')) {
                            return { ...sub, name: sub.name.replace('Professional Elective', 'Cloud Computing Elective') };
                        }
                        return sub;
                    })
                };
            }
            return sem;
        }),
        totalCredits: 173
    },
    {
        id: 'cse-iot',
        name: 'B.Tech CSE (IoT & Intelligent Systems)',
        description: 'Internet of Things, Embedded Systems, and Smart Device Integration',
        semesters: CSE_CORE_SEMESTERS.map((sem, idx) => {
            if (idx >= 4) {
                return {
                    ...sem,
                    focus: idx === 4 ? "IoT Fundamentals, Embedded Systems, and Sensor Networks" :
                        idx === 5 ? "Smart Systems, Edge Computing, and IoT Security" :
                            idx === 6 ? "Industrial IoT, Intelligent Systems, and Major Project Phase I" :
                                "IoT Capstone Project and Industry Integration",
                    subjects: sem.subjects.map(sub => {
                        if (sub.code.includes('XX') || sub.code.includes('YY')) {
                            return { ...sub, name: sub.name.replace('Professional Elective', 'IoT Elective') };
                        }
                        if (sub.code === 'CSE502') return { ...sub, name: 'IoT Architecture & Protocols' };
                        if (sub.code === 'CSE601') return { ...sub, name: 'Embedded Systems Design' };
                        if (sub.code === 'CSE701') return { ...sub, name: 'Industrial IoT & Smart Cities' };
                        return sub;
                    })
                };
            }
            return sem;
        }),
        totalCredits: 173,
        focusAreas: [
            'Embedded Systems & Microcontrollers',
            'Sensor Networks & Actuators',
            'IoT Protocols (MQTT, CoAP, LoRa)',
            'Edge & Fog Computing',
            'Smart Device Integration',
            'Industrial IoT Applications'
        ]
    }
];

export function SyllabusArchivePage() {
    const [expandedProgram, setExpandedProgram] = useState(null);
    const [expandedSemester, setExpandedSemester] = useState({});

    const toggleProgram = (programId) => {
        setExpandedProgram(expandedProgram === programId ? null : programId);
        setExpandedSemester({}); // Reset semester expansions when switching programs
    };

    const toggleSemester = (programId, semester) => {
        setExpandedSemester(prev => ({
            ...prev,
            [`${programId}-${semester}`]: !prev[`${programId}-${semester}`]
        }));
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            {/* Page Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muj-orange/10 dark:bg-muj-orange/20 rounded-full mb-4">
                    <BookOpen className="w-5 h-5 text-muj-orange" />
                    <span className="text-sm font-semibold text-muj-orange">Academic Curriculum</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 font-display">
                    Syllabus Archive
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Comprehensive semester-wise breakdown for all B.Tech CSE programs and specializations
                </p>
            </div>

            {/* Program Dropdowns */}
            <div className="space-y-6">
                {PROGRAMS.map((program) => (
                    <div key={program.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                        {/* Program Header */}
                        <div
                            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            onClick={() => toggleProgram(program.id)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <GraduationCap className="w-8 h-8 text-muj-orange" />
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-display">
                                            {program.name}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {program.description} • {program.totalCredits} Total Credits
                                        </p>
                                    </div>
                                </div>
                                {expandedProgram === program.id ? (
                                    <ChevronUp className="w-6 h-6 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* Semester Cards (shown when program is expanded) */}
                        {expandedProgram === program.id && (
                            <div className="px-6 pb-6 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                                {program.semesters.map((sem) => (
                                    <Card
                                        key={sem.semester}
                                        className="border-muj-yellow/30 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-800"
                                        onClick={() => toggleSemester(program.id, sem.semester)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-muj-orange text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg">
                                                        {sem.semester}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                                                            Semester {sem.semester}
                                                        </CardTitle>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {sem.credits} Credits • {sem.subjects.length} Subjects
                                                        </p>
                                                    </div>
                                                </div>
                                                {expandedSemester[`${program.id}-${sem.semester}`] ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-3 pl-16">
                                                Focus: {sem.focus}
                                            </p>
                                        </CardHeader>

                                        {expandedSemester[`${program.id}-${sem.semester}`] && (
                                            <CardContent className="pt-0">
                                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                                    <div className="grid gap-3">
                                                        {sem.subjects.map((subject, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {subject.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {subject.code}
                                                                    </p>
                                                                </div>
                                                                <span className="px-3 py-1 bg-muj-orange/10 dark:bg-muj-orange/20 text-muj-orange rounded-full text-sm font-semibold">
                                                                    {subject.credits} Credits
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info Note */}
            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong>Note:</strong> Semesters 1-4 are common across all B.Tech CSE programs. Specialization-specific electives and projects begin from Semester 5 onwards.
                    Students select professional electives aligned with their chosen specialization domain.
                </p>
            </div>
        </div>
    );
}