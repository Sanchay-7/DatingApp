// app/profile-setup/page.jsx

import ProfileCreationForm from '@/components/onboarding/ProfileCreationForm';
// The '@/' is a shortcut for the project root, commonly used in Next.js.

// This is the functional component that Next.js renders for the /profile-setup route
export default function ProfileSetupPage() {
    return (
        // We render the main component here
        <ProfileCreationForm />
    );
}