import { View, Text, Alert } from 'react-native';
import { LogOut, GraduationCap, Mail, School, User } from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const rows: { Icon: typeof User; label: string; value: string }[] = [
    { Icon: User, label: 'Name', value: profile?.display_name ?? '—' },
    { Icon: Mail, label: 'Email', value: user?.email ?? '—' },
    { Icon: School, label: 'School', value: profile?.school ?? '—' },
    { Icon: GraduationCap, label: 'Grade', value: profile?.grade_level ? `Grade ${profile.grade_level}` : '—' },
  ];

  return (
    <Screen>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-foreground mb-6">Profile</Text>

        <View
          className="bg-card rounded-2xl p-6 mb-4 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-2xl font-bold text-primary-foreground">
              {(profile?.display_name ?? 'S').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl font-bold text-foreground">
            {profile?.display_name ?? 'Student'}
          </Text>
          <Text className="text-sm text-muted-foreground capitalize">{profile?.role ?? 'student'}</Text>
        </View>

        <View className="bg-card rounded-2xl p-5 mb-6 gap-4">
          {rows.map((r) => (
            <View key={r.label} className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <r.Icon color="#676D76" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">{r.label}</Text>
                <Text className="text-sm font-medium text-foreground">{r.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          variant="destructive"
          fullWidth
          onPress={handleSignOut}
          leftIcon={<LogOut color="white" size={16} />}
        >
          Sign Out
        </Button>
      </View>
    </Screen>
  );
}
