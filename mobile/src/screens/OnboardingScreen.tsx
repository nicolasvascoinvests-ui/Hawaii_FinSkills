import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { MotiView } from 'moti';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { useProfile } from '../hooks/useProfile';

const SCHOOLS = [
  'Farrington High School',
  'Kalani High School',
  'Kaiser High School',
  'Kaimukī High School',
  'McKinley High School',
  'Moanalua High School',
  'Roosevelt High School',
  'Castle High School',
  'Kahuku High School',
  'Mililani High School',
  'Pearl City High School',
  'Waipahu High School',
  'Other',
];

const SCHOOL_OPTIONS = SCHOOLS.map((s) => ({ label: s, value: s }));
const GRADE_OPTIONS = [9, 10, 11, 12].map((g) => ({ label: `Grade ${g}`, value: String(g) }));

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  const canSubmit = name.trim().length > 0 && school.length > 0 && grade.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await updateProfile.mutateAsync({
        display_name: name.trim(),
        school,
        grade_level: parseInt(grade, 10),
        onboarding_completed: true,
      });
    } catch {
      // surfaced via mutation state
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full max-w-sm self-center"
          >
            <View className="items-center mb-8">
              <Text className="text-4xl mb-3">🌺</Text>
              <Text className="text-2xl font-bold text-foreground">E komo mai!</Text>
              <Text className="text-muted-foreground text-sm text-center mt-1">
                Tell us a little about yourself to get started.
              </Text>
            </View>

            <View className="gap-5">
              <Input
                label="Your Name"
                value={name}
                onChangeText={setName}
                placeholder="First name"
                maxLength={100}
                autoComplete="given-name"
              />
              <Select
                label="School"
                value={school}
                onChange={setSchool}
                options={SCHOOL_OPTIONS}
                placeholder="Select your school"
              />
              <Select
                label="Grade Level"
                value={grade}
                onChange={setGrade}
                options={GRADE_OPTIONS}
                placeholder="Select grade"
              />
              <Button
                onPress={handleSubmit}
                loading={loading}
                disabled={!canSubmit}
                fullWidth
                size="lg"
              >
                Start Learning
              </Button>
            </View>
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
