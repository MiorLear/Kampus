# 👤 User Profile System - Hybrid Approach (Solution 3)

## 📋 Overview

This is a comprehensive user profile viewing system that uses a **hybrid architecture** combining:
- **Shared base components** for common elements (Personal Info, Preferences, Contact)
- **Role-specific extensions** for unique features (Student, Teacher, Admin)
- **Smart router** that dynamically loads the appropriate profile view

## 🏗️ Architecture

```
src/components/profiles/
├── BaseProfile/
│   ├── ProfileLayout.tsx          # Main layout with header, avatar, tabs
│   └── shared/
│       ├── PersonalInfo.tsx       # Personal information section
│       └── PreferencesSection.tsx # User preferences
├── extensions/
│   ├── StudentExtensions.tsx      # Student-specific views (grades, courses, etc.)
│   ├── TeacherExtensions.tsx      # Teacher-specific views (education, research, etc.)
│   └── AdminExtensions.tsx        # Admin-specific views (permissions, audit trail)
├── ProfileRouter.tsx               # Main router component
├── ProfilePage.tsx                 # Full page wrapper with loading/error states
└── README.md                       # This file
```

## 🎯 Key Features

### For All Users (Shared Components)
- ✅ Avatar with status indicator
- ✅ Personal information display
- ✅ Contact details
- ✅ User preferences (language, theme, notifications)
- ✅ Account creation and last login dates
- ✅ Export profile as JSON
- ✅ Share profile link

### Student-Specific Features
- 📊 Academic stats dashboard (courses, grades, assignments)
- 🎓 Academic information (student ID, program, semester)
- 📚 Learning preferences and style
- 🎯 Personal goals and interests
- 👨‍👩‍👦 Emergency contact information
- ♿ Accessibility needs

### Teacher-Specific Features
- 👨‍🏫 Teaching stats (courses taught, students, ratings)
- 🎓 Education history and degrees
- 🏆 Certifications and credentials
- 🔬 Research areas and publications
- 🕒 Office hours schedule
- 📝 Bio and specializations

### Admin-Specific Features
- 🛡️ Admin level badge (Super Admin, Admin, Moderator)
- 📊 Administrative stats and activity
- 🔐 Detailed permissions matrix
- 📋 Responsibilities and managed departments
- 🔍 Audit trail with login history
- ⚙️ Admin-specific preferences

## 🚀 Usage

### Basic Usage

```tsx
import { ProfilePage } from './components/profiles/ProfilePage';

function App() {
  return (
    <ProfilePage 
      userId="user-id-here" 
      currentUserId="current-user-id" 
    />
  );
}
```

### Using ProfileRouter Directly

```tsx
import { ProfileRouter } from './components/profiles/ProfileRouter';
import { UserProfile } from './types/user-profiles';

function ProfileView({ profile }: { profile: UserProfile }) {
  return (
    <ProfileRouter
      profile={profile}
      onEdit={() => console.log('Edit clicked')}
      onExport={() => console.log('Export clicked')}
      onShare={() => console.log('Share clicked')}
    />
  );
}
```

### Displaying Profile Card in Lists

```tsx
import { ProfileCard } from './components/profiles/ProfileRouter';

function UserList({ users }: { users: UserProfile[] }) {
  return (
    <div className="grid gap-4">
      {users.map(user => (
        <ProfileCard key={user.id} profile={user} />
      ))}
    </div>
  );
}
```

## 🔧 Customization

### Adding New Sections

1. **For all roles**: Add component to `BaseProfile/shared/`
2. **For specific role**: Add to respective extension file
3. **Update ProfileRouter**: Include new tab/section

Example:
```tsx
// In BaseProfile/shared/NewSection.tsx
export function NewSection({ profile }: { profile: UserProfile }) {
  return <Card>...</Card>;
}

// In ProfileRouter.tsx
<TabsTrigger value="new">New Section</TabsTrigger>
<TabsContent value="new">
  <NewSection profile={profile} />
</TabsContent>
```

### Creating New Role Extensions

```tsx
// In extensions/NewRoleExtensions.tsx
export function NewRoleOverview({ profile }: { profile: NewRoleProfile }) {
  return (
    <div className="space-y-4">
      {/* Your role-specific content */}
    </div>
  );
}

// Update ProfileRouter.tsx
if (isNewRoleProfile(profile)) {
  return <NewRoleOverview profile={profile as NewRoleProfile} />;
}
```

## 📦 Dependencies

This profile system uses:
- **UI Components**: Radix UI (via shadcn/ui)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Type System**: Custom user profile types
- **Services**: UserProfileService for data operations

## 🎨 Styling

The profile system uses Tailwind CSS with the following conventions:
- **Cards**: Use `Card`, `CardHeader`, `CardContent` components
- **Spacing**: Consistent `space-y-4` for vertical spacing
- **Grids**: Responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Colors**: Role-based color schemes (blue=teacher, green=student, red=admin)

## 🔄 State Management

Profile data is managed through:
1. **Firebase Firestore** - Data persistence
2. **UserProfileService** - CRUD operations
3. **React State** - Local component state
4. **Loading/Error States** - Built into ProfilePage component

## 🧪 Testing

To test with sample data:
```tsx
import { seedAllProfiles } from './utils/seed-profiles';

// Seed database with sample profiles
await seedAllProfiles();
```

## 📝 Type Safety

All components are fully typed using TypeScript:
- `StudentProfile` - Student-specific fields
- `TeacherProfile` - Teacher-specific fields
- `AdminProfile` - Admin-specific fields
- `UserProfile` - Union type of all profiles

Type guards are provided:
```tsx
import { isStudentProfile, isTeacherProfile, isAdminProfile } from './types/user-profiles';

if (isStudentProfile(profile)) {
  // TypeScript knows this is StudentProfile
  console.log(profile.student_id);
}
```

## 🚦 Next Steps

Potential enhancements:
- [ ] Edit mode for profile fields
- [ ] Profile picture upload
- [ ] Activity timeline
- [ ] Social features (followers, connections)
- [ ] Privacy settings
- [ ] Profile completion percentage
- [ ] Custom profile themes
- [ ] PDF export option

## 🤝 Integration Points

The profile system integrates with:
- **Navigation** - Profile menu item
- **Dashboard** - User stats and info
- **Admin Panel** - User management
- **Authentication** - User role-based access

## 📚 Related Files

- `src/types/user-profiles.ts` - Type definitions
- `src/services/user-profile.service.ts` - Data operations
- `src/data/sample-users.ts` - Sample data
- `src/utils/seed-profiles.ts` - Database seeding
- `src/App.tsx` - Main integration

## 💡 Tips

1. **Performance**: Profile data is fetched once and cached in component state
2. **Security**: Always validate user permissions before showing edit buttons
3. **Responsive**: All layouts are mobile-friendly
4. **Accessibility**: Uses semantic HTML and ARIA labels
5. **Maintainability**: Separate concerns (base, extensions, router)

---

**Built with ❤️ using Solution 3 (Hybrid Approach)**

