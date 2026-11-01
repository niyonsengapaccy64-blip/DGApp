import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CourseCatalogueScreen from '../../screens/courses/CourseCatalogueScreen';

export default function CoursesTab() {
    const params = useLocalSearchParams<{ action?: string }>();
    return <CourseCatalogueScreen initialAction={params.action} />;
}
