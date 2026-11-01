import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';

export interface Course {
    id: string;
    title: string;
    code: string;
    category: string;
    instructor: string;
    instructorRole: string;
    rating: number;
    enrolledCount: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    description: string;
    syllabus: string[];
    price: string;
    isFeatured?: boolean;
    isEnrolled?: boolean;
    colorAccent?: string;
}

const STORAGE_KEY_COURSES = '@dg_catalogue_courses';
const STORAGE_KEY_ENROLLED = '@dg_enrolled_courses';

const INITIAL_COURSES: Course[] = [
    {
        id: 'course-1',
        title: 'Full-Stack React Native & Expo SDK 58 Mastery',
        code: 'CS-401',
        category: 'Mobile Dev',
        instructor: 'Jean-Paul Ndayambaje',
        instructorRole: 'Principal Mobile Architect',
        rating: 4.9,
        enrolledCount: 1240,
        duration: '8 Weeks • 36 Lessons',
        level: 'Intermediate',
        price: 'Free',
        isFeatured: true,
        colorAccent: '#0284C7',
        description:
            'Master cross-platform application engineering with React Native 0.88, Expo Router v58, and TypeScript. Build high-performance mobile apps with hardware biometric authentication, offline synchronization, and frictionless navigation.',
        syllabus: [
            '1. React Native & Expo Router File-Based Architecture',
            '2. State Management with React Context & AsyncStorage',
            '3. Device Biometrics & Hardware Security Token Handshakes',
            '4. Network Interceptors, Offline Fallbacks & Resilience',
            '5. Production Release on Android (APK) & iOS (TestFlight)',
        ],
    },
    {
        id: 'course-2',
        title: 'Modern E-Commerce Store Management & Retail in Rwanda',
        code: 'BUS-204',
        category: 'Business & Retail',
        instructor: 'Aline Umutoni',
        instructorRole: 'Retail Growth Director, Kigali',
        rating: 4.8,
        enrolledCount: 980,
        duration: '6 Weeks • 24 Lessons',
        level: 'Beginner',
        price: '25,000 RWF',
        isFeatured: true,
        colorAccent: '#6366F1',
        description:
            'A comprehensive guide to managing modern online retail operations in Rwanda. Learn inventory copy tracking, two-way delivery handshake management, MTN MoMo & Airtel Money gateway integration, and customer retention.',
        syllabus: [
            '1. Rwandan Retail Landscape & Cashless Economy Agendas',
            '2. Multi-Channel Inventory Control & Depletion Triggers',
            '3. District-Based Delivery Routing (Kigali, Rwamagana, Huye)',
            '4. Digital Payment Reconciliation (MoMo & Bank Transfer)',
            '5. Financial Reporting, Tax Compliance & Profit Analytics',
        ],
    },
    {
        id: 'course-3',
        title: 'UI/UX Design Systems for Next-Gen Mobile Experiences',
        code: 'DES-310',
        category: 'UI/UX Design',
        instructor: 'Kevin Habimana',
        instructorRole: 'Lead Product Designer',
        rating: 4.95,
        enrolledCount: 860,
        duration: '5 Weeks • 20 Lessons',
        level: 'All Levels',
        price: 'Free',
        isFeatured: true,
        colorAccent: '#10B981',
        description:
            'Learn to design mobile interfaces that convert. Covers glassmorphism, micro-interactions, responsive insets, accessibility, dark/light themes, and design tokens for Android and iOS.',
        syllabus: [
            '1. Design Foundations: Grid, Spatial Units & Typography',
            '2. Micro-Interactions, Feedback States & Haptics',
            '3. Building Design Tokens & Reusable Component Libraries',
            '4. Prototyping Hamburger Drawers & Gestural Navigation',
            '5. User Testing & Design-to-Code Handoff',
        ],
    },
    {
        id: 'course-4',
        title: 'FastAPI & Cloud Database Architecture for Web & Mobile',
        code: 'BACK-502',
        category: 'Cloud Backend',
        instructor: 'Samuel Tr-Champ',
        instructorRole: 'Cloud Systems Engineer',
        rating: 4.85,
        enrolledCount: 740,
        duration: '7 Weeks • 28 Lessons',
        level: 'Advanced',
        price: '30,000 RWF',
        colorAccent: '#F59E0B',
        description:
            'Architect scalable backend REST APIs with Python 3.11, FastAPI, and PostgreSQL. Implement JWT authentication, RBAC authorization, automated migrations, and deploy to Render and Neon cloud databases.',
        syllabus: [
            '1. FastAPI Async Framework & Pydantic Data Models',
            '2. SQLAlchemy ORM & Relational Schema Migrations',
            '3. JWT Authentication & Hardware Device-Binding Endpoints',
            '4. Image Upload CDNs & Storage Integrations',
            '5. Production Deployment, Health Probing & Monitoring',
        ],
    },
    {
        id: 'course-5',
        title: 'Digital Marketing & Growth Hacking for Startups',
        code: 'MKT-101',
        category: 'Business & Retail',
        instructor: 'Diane Mukamana',
        instructorRole: 'Growth Marketing Lead',
        rating: 4.75,
        enrolledCount: 650,
        duration: '4 Weeks • 16 Lessons',
        level: 'Beginner',
        price: 'Free',
        colorAccent: '#EC4899',
        description:
            'Accelerate customer acquisition through social media marketing, content strategies, SEO, and community building tailored for East African markets.',
        syllabus: [
            '1. Social Commerce: WhatsApp Business & TikTok Strategies',
            '2. Paid Ad Campaigns on Meta & Google Ads',
            '3. Copywriting That Converts: Local Tone & Localization',
            '4. Analytics, Customer Acquisition Cost (CAC) & LTV',
        ],
    },
];

const CATEGORIES = ['All', 'Mobile Dev', 'Business & Retail', 'UI/UX Design', 'Cloud Backend'];

export default function CourseCatalogueScreen({ initialAction }: { initialAction?: string }) {
    const { t, lang } = useLanguage();
    const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showAddModal, setShowAddModal] = useState(initialAction === 'add');
    const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
    const listRef = useRef<FlatList>(null);

    // Form state for Add Course
    const [formTitle, setFormTitle] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formCategory, setFormCategory] = useState('Mobile Dev');
    const [formInstructor, setFormInstructor] = useState('');
    const [formInstructorRole, setFormInstructorRole] = useState('');
    const [formDuration, setFormDuration] = useState('6 Weeks • 24 Lessons');
    const [formLevel, setFormLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [formPrice, setFormPrice] = useState('Free');
    const [formDescription, setFormDescription] = useState('');
    const [formSyllabus, setFormSyllabus] = useState('');

    useEffect(() => {
        loadSavedCourses();
    }, []);

    const loadSavedCourses = async () => {
        try {
            const [savedCoursesJson, enrolledJson] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEY_COURSES),
                AsyncStorage.getItem(STORAGE_KEY_ENROLLED),
            ]);

            if (enrolledJson) {
                setEnrolledIds(JSON.parse(enrolledJson));
            }

            if (savedCoursesJson) {
                const parsed: Course[] = JSON.parse(savedCoursesJson);
                // Combine custom added courses with default ones
                const mergedMap = new Map<string, Course>();
                INITIAL_COURSES.forEach((c) => mergedMap.set(c.id, c));
                parsed.forEach((c) => mergedMap.set(c.id, c));
                setCourses(Array.from(mergedMap.values()));
            }
        } catch (e) {
            console.error('Error loading courses from storage', e);
        }
    };

    const handleSaveNewCourse = async () => {
        if (!formTitle.trim() || !formInstructor.trim() || !formDescription.trim()) {
            Alert.alert('Missing Fields', 'Please provide Course Title, Instructor Name, and Description.');
            return;
        }

        const newId = `course-custom-${Date.now()}`;
        const syllabusItems = formSyllabus
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

        const newCourse: Course = {
            id: newId,
            title: formTitle.trim(),
            code: formCode.trim() || `CRS-${Math.floor(100 + Math.random() * 900)}`,
            category: formCategory,
            instructor: formInstructor.trim(),
            instructorRole: formInstructorRole.trim() || 'Course Instructor',
            rating: 5.0,
            enrolledCount: 1,
            duration: formDuration.trim() || '4 Weeks',
            level: formLevel,
            price: formPrice.trim() || 'Free',
            description: formDescription.trim(),
            syllabus:
                syllabusItems.length > 0
                    ? syllabusItems
                    : [
                          '1. Introduction & Course Orientation',
                          '2. Core Concepts & Practical Foundations',
                          '3. Advanced Applications & Practical Case Study',
                          '4. Final Project & Certification',
                      ],
            colorAccent: Colors.primary,
        };

        const updated = [newCourse, ...courses];
        setCourses(updated);

        try {
            await AsyncStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(updated));
            Alert.alert(
                'Course Published! 🎉',
                `"${newCourse.title}" is now added to your catalogue. Students can browse and enroll immediately.`
            );
            // Reset form
            setFormTitle('');
            setFormCode('');
            setFormInstructor('');
            setFormInstructorRole('');
            setFormDescription('');
            setFormSyllabus('');
            setShowAddModal(false);
        } catch (e) {
            Alert.alert('Error', 'Could not save course to local catalogue.');
        }
    };

    const handleToggleEnroll = async (course: Course) => {
        const isEnrolled = enrolledIds.includes(course.id);
        let updated: string[];
        if (isEnrolled) {
            updated = enrolledIds.filter((id) => id !== course.id);
            Alert.alert('Course Dropped', `You have unenrolled from "${course.title}".`);
        } else {
            updated = [...enrolledIds, course.id];
            Alert.alert(
                'Enrollment Successful! 🎓',
                `Congratulations! You are now enrolled in "${course.title}". You can start your learning modules immediately.`
            );
        }
        setEnrolledIds(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEY_ENROLLED, JSON.stringify(updated));
        } catch (e) {
            console.error('Error saving enrollment', e);
        }
    };

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesCategory =
                selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                course.title.toLowerCase().includes(q) ||
                course.code.toLowerCase().includes(q) ||
                course.instructor.toLowerCase().includes(q) ||
                course.description.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [courses, selectedCategory, searchQuery]);

    const scrollToCourses = () => {
        listRef.current?.scrollToOffset({ offset: 240, animated: true });
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={listRef}
                data={filteredCourses}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.headerComponent}>
                        {/* HERO BANNER - Exact wording requested by user */}
                        <View style={styles.heroBanner}>
                            <View style={styles.heroGlowAccent} />
                            <View style={styles.heroBadgeRow}>
                                <View style={styles.academyBadge}>
                                    <Ionicons name="sparkles" size={12} color={Colors.accent} />
                                    <Text style={styles.academyBadgeText}>DG ACADEMY</Text>
                                </View>
                                <View style={styles.statsPill}>
                                    <Text style={styles.statsPillText}>{courses.length} Courses</Text>
                                </View>
                            </View>

                            <Text style={styles.heroTitle}>Catalogue of Excellence</Text>
                            <Text style={styles.heroSubtitle}>
                                Browse available courses, explore course details, or add a new course to your catalogue.
                            </Text>

                            {/* PRIMARY CALL-TO-ACTION BUTTONS */}
                            <View style={styles.heroButtonRow}>
                                <TouchableOpacity
                                    style={styles.browseCoursesBtn}
                                    onPress={scrollToCourses}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.browseCoursesText}>Browse Courses</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addCourseBtn}
                                    onPress={() => setShowAddModal(true)}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="add-circle" size={18} color={Colors.primary} />
                                    <Text style={styles.addCourseText}>+ Add a Course</Text>
                                </TouchableOpacity>
                            </View>

                            {/* FOOTER TAGLINE */}
                            <View style={styles.taglineBox}>
                                <Text style={styles.taglineText}>Learn • Explore • Grow</Text>
                            </View>
                        </View>

                        {/* SEARCH INPUT */}
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={20} color={Colors.textMuted} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search courses, instructors, topics..."
                                placeholderTextColor={Colors.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* CATEGORY PILLS */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScroll}
                        >
                            {CATEGORIES.map((cat) => {
                                const active = selectedCategory === cat;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryPill, active && styles.categoryPillActive]}
                                        onPress={() => setSelectedCategory(cat)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>
                                {selectedCategory === 'All' ? 'All Available Courses' : `${selectedCategory} Courses`}
                            </Text>
                            <Text style={styles.resultCountText}>{filteredCourses.length} results</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    const isEnrolled = enrolledIds.includes(item.id);
                    return (
                        <View style={styles.courseCard}>
                            <View style={styles.cardTopRow}>
                                <View
                                    style={[
                                        styles.categoryBadge,
                                        { backgroundColor: item.colorAccent ? `${item.colorAccent}15` : Colors.primaryLight },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.categoryBadgeText,
                                            { color: item.colorAccent || Colors.primary },
                                        ]}
                                    >
                                        {item.category}
                                    </Text>
                                </View>
                                <View style={styles.codeBadge}>
                                    <Text style={styles.codeBadgeText}>{item.code}</Text>
                                </View>
                            </View>

                            <Text style={styles.courseTitle}>{item.title}</Text>
                            <Text style={styles.courseDescription} numberOfLines={2}>
                                {item.description}
                            </Text>

                            <View style={styles.metaRow}>
                                <View style={styles.instructorBox}>
                                    <Ionicons name="person-circle-outline" size={16} color={Colors.secondary} />
                                    <Text style={styles.instructorName} numberOfLines={1}>
                                        {item.instructor}
                                    </Text>
                                </View>
                                <View style={styles.ratingBox}>
                                    <Ionicons name="star" size={14} color={Colors.gold} />
                                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                </View>
                            </View>

                            <View style={styles.courseFooter}>
                                <View>
                                    <Text style={styles.durationText}>
                                        <Ionicons name="time-outline" size={12} color={Colors.textMuted} /> {item.duration}
                                    </Text>
                                    <Text style={styles.priceText}>{item.price}</Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.detailsBtn}
                                        onPress={() => setSelectedCourse(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.detailsBtnText}>Explore Details</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.enrollBtn, isEnrolled && styles.enrolledBtn]}
                                        onPress={() => handleToggleEnroll(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons
                                            name={isEnrolled ? 'checkmark-circle' : 'add-outline'}
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.enrollBtnText}>{isEnrolled ? 'Enrolled' : 'Enroll'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Ionicons name="school-outline" size={54} color={Colors.borderStrong} />
                        <Text style={styles.emptyTitle}>No courses found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your search query or add a brand-new course!</Text>
                        <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
                            <Text style={styles.emptyAddBtnText}>+ Add This Course to Catalogue</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* MODAL 1: EXPLORE COURSE DETAILS */}
            <Modal
                visible={!!selectedCourse}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedCourse(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCourse && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalCategoryText}>
                                            {selectedCourse.category} • {selectedCourse.code}
                                        </Text>
                                        <Text style={styles.modalTitle}>{selectedCourse.title}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedCourse(null)}
                                        style={styles.closeBtn}
                                    >
                                        <Ionicons name="close" size={22} color={Colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                                    <View style={styles.instructorCard}>
                                        <Ionicons name="person-circle" size={44} color={Colors.primary} />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.instructorModalName}>{selectedCourse.instructor}</Text>
                                            <Text style={styles.instructorRoleText}>
                                                {selectedCourse.instructorRole}
                                            </Text>
                                            <View style={styles.instructorStats}>
                                                <Ionicons name="star" size={14} color={Colors.gold} />
                                                <Text style={styles.instructorRatingText}>
                                                    {selectedCourse.rating.toFixed(2)} rating •{' '}
                                                    {selectedCourse.enrolledCount.toLocaleString()} learners
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.detailSectionTitle}>Course Overview</Text>
                                    <Text style={styles.detailBody}>{selectedCourse.description}</Text>

                                    <View style={styles.quickSpecsRow}>
                                        <View style={styles.specBox}>
                                            <Ionicons name="time" size={18} color={Colors.primary} />
                                            <Text style={styles.specTitle}>Duration</Text>
                                            <Text style={styles.specValue}>{selectedCourse.duration}</Text>
                                        </View>
                                        <View style={styles.specBox}>
                                            <Ionicons name="cellular" size={18} color={Colors.secondary} />
                                            <Text style={styles.specTitle}>Difficulty</Text>
                                            <Text style={styles.specValue}>{selectedCourse.level}</Text>
                                        </View>
                                        <View style={styles.specBox}>
                                            <Ionicons name="pricetag" size={18} color={Colors.accent} />
                                            <Text style={styles.specTitle}>Investment</Text>
                                            <Text style={styles.specValue}>{selectedCourse.price}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.detailSectionTitle}>Curriculum & Syllabus</Text>
                                    {selectedCourse.syllabus.map((topic, idx) => (
                                        <View key={idx} style={styles.syllabusRow}>
                                            <View style={styles.syllabusDot} />
                                            <Text style={styles.syllabusText}>{topic}</Text>
                                        </View>
                                    ))}

                                    <View style={styles.guaranteeBox}>
                                        <Ionicons name="ribbon-outline" size={24} color={Colors.primary} />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.guaranteeTitle}>Certificate of Completion Included</Text>
                                            <Text style={styles.guaranteeText}>
                                                Issued by DG Academy upon finishing all modules and passing final capstone project.
                                            </Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalEnrollBtn,
                                            enrolledIds.includes(selectedCourse.id) && styles.modalEnrolledBtn,
                                        ]}
                                        onPress={() => handleToggleEnroll(selectedCourse)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={
                                                enrolledIds.includes(selectedCourse.id)
                                                    ? 'checkmark-done-circle'
                                                    : 'school'
                                            }
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.modalEnrollText}>
                                            {enrolledIds.includes(selectedCourse.id)
                                                ? 'Enrolled in Course (Click to Drop)'
                                                : `Enroll Now — ${selectedCourse.price}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* MODAL 2: + ADD A COURSE TO CATALOGUE */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowAddModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>+ Add a New Course</Text>
                                <Text style={styles.modalSubtitle}>Publish to the catalogue for all learners</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={22} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Course Title *</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g. Next-Gen Mobile App Development"
                                placeholderTextColor={Colors.textLight}
                                value={formTitle}
                                onChangeText={setFormTitle}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Course Code</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. CS-501"
                                        placeholderTextColor={Colors.textLight}
                                        value={formCode}
                                        onChangeText={setFormCode}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Price</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="e.g. Free or 20,000 RWF"
                                        placeholderTextColor={Colors.textLight}
                                        value={formPrice}
                                        onChangeText={setFormPrice}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Category</Text>
                            <View style={styles.pillSelectRow}>
                                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryFormPill,
                                            formCategory === cat && styles.categoryFormPillActive,
                                        ]}
                                        onPress={() => setFormCategory(cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryFormPillText,
                                                formCategory === cat && styles.categoryFormPillTextActive,
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Instructor Name *</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g. Dr. Pacifique Niyonsenga"
                                placeholderTextColor={Colors.textLight}
                                value={formInstructor}
                                onChangeText={setFormInstructor}
                            />

                            <Text style={styles.inputLabel}>Instructor Title / Role</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g. Lead Software Engineer & Lecturer"
                                placeholderTextColor={Colors.textLight}
                                value={formInstructorRole}
                                onChangeText={setFormInstructorRole}
                            />

                            <Text style={styles.inputLabel}>Duration & Modules</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="e.g. 6 Weeks • 24 Lessons"
                                placeholderTextColor={Colors.textLight}
                                value={formDuration}
                                onChangeText={setFormDuration}
                            />

                            <Text style={styles.inputLabel}>Difficulty Level</Text>
                            <View style={styles.pillSelectRow}>
                                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                                    <TouchableOpacity
                                        key={lvl}
                                        style={[styles.categoryFormPill, formLevel === lvl && styles.categoryFormPillActive]}
                                        onPress={() => setFormLevel(lvl)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryFormPillText,
                                                formLevel === lvl && styles.categoryFormPillTextActive,
                                            ]}
                                        >
                                            {lvl}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Course Description *</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                placeholder="Write a summary of what students will achieve in this course..."
                                placeholderTextColor={Colors.textLight}
                                value={formDescription}
                                onChangeText={setFormDescription}
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={styles.inputLabel}>Syllabus Outline (One item per line)</Text>
                            <TextInput
                                style={[styles.formInput, styles.textArea]}
                                placeholder={"1. Fundamentals\n2. Practical Implementation\n3. Capstone Project"}
                                placeholderTextColor={Colors.textLight}
                                value={formSyllabus}
                                onChangeText={setFormSyllabus}
                                multiline
                                numberOfLines={4}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSaveNewCourse}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                                <Text style={styles.submitBtnText}>Add Course to Catalogue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    headerComponent: {
        paddingTop: 12,
        paddingBottom: 8,
    },
    // HERO BANNER
    heroBanner: {
        backgroundColor: Colors.dark,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    heroGlowAccent: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(2, 132, 199, 0.25)',
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    academyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.35)',
        gap: 6,
    },
    academyBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.accent,
        letterSpacing: 1.5,
    },
    statsPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    statsPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 13,
        lineHeight: 19,
        color: '#CBD5E1',
        marginBottom: 18,
    },
    heroButtonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    browseCoursesBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    browseCoursesText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    addCourseBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    addCourseText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    taglineBox: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    taglineText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.accent,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    // SEARCH BOX
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
    },
    // CATEGORY PILLS
    categoryScroll: {
        paddingVertical: 4,
        gap: 8,
        marginBottom: 14,
    },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryPillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    categoryPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    resultCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    // COURSE CARD
    courseCard: {
        backgroundColor: Colors.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    codeBadge: {
        backgroundColor: Colors.cardMuted,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    codeBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 6,
        lineHeight: 22,
    },
    courseDescription: {
        fontSize: 13,
        color: Colors.textMuted,
        lineHeight: 18,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    instructorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    instructorName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
    },
    courseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    priceText: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.primary,
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    detailsBtn: {
        backgroundColor: Colors.cardMuted,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    detailsBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
    },
    enrollBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    enrolledBtn: {
        backgroundColor: Colors.accent,
    },
    enrollBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // EMPTY STATE
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 12,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyAddBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
    },
    emptyAddBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        maxHeight: '88%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 14,
    },
    modalCategoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    modalSubtitle: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        padding: 6,
        borderRadius: 16,
        backgroundColor: Colors.cardMuted,
    },
    instructorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardMuted,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
    },
    instructorModalName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    instructorRoleText: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    instructorStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    instructorRatingText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    detailSectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 10,
        marginBottom: 8,
    },
    detailBody: {
        fontSize: 13,
        lineHeight: 20,
        color: Colors.text,
        marginBottom: 14,
    },
    quickSpecsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    specBox: {
        flex: 1,
        backgroundColor: Colors.cardMuted,
        borderRadius: 14,
        padding: 10,
        alignItems: 'center',
    },
    specTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textMuted,
        marginTop: 4,
    },
    specValue: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 2,
        textAlign: 'center',
    },
    syllabusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 10,
    },
    syllabusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    syllabusText: {
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    guaranteeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        borderRadius: 14,
        padding: 14,
        marginTop: 16,
        marginBottom: 16,
    },
    guaranteeTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primaryDark,
    },
    guaranteeText: {
        fontSize: 11,
        color: Colors.primaryDark,
        marginTop: 2,
    },
    modalFooter: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    modalEnrollBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    modalEnrolledBtn: {
        backgroundColor: Colors.accent,
    },
    modalEnrollText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    // FORM STYLES
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 10,
        marginBottom: 6,
    },
    formInput: {
        backgroundColor: Colors.cardMuted,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textArea: {
        minHeight: 70,
        textAlignVertical: 'top',
    },
    pillSelectRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 6,
    },
    categoryFormPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.cardMuted,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryFormPillActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    categoryFormPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    categoryFormPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    submitBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
