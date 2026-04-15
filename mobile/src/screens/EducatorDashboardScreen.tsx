import { useState } from 'react';
import { View, Text, Pressable, Alert, Share } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Plus,
  Users,
  Copy,
  Trash2,
} from 'lucide-react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { TOTAL_STANDARDS } from '../lib/standards';
import type {
  ClassRecord,
  ClassMember,
  Profile,
  StandardMastery,
} from '../types/database';
import type { RootStackScreenProps } from '../navigation/types';

export default function EducatorDashboardScreen({
  navigation,
}: RootStackScreenProps<'EducatorDashboard'>) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const { data: classes = [] } = useQuery({
    queryKey: ['educator-classes', user?.id],
    queryFn: async () => {
      if (!user) return [] as ClassRecord[];
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('educator_id', user.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as ClassRecord[];
    },
    enabled: !!user,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['class-members', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [] as ClassMember[];
      const { data } = await supabase
        .from('class_members')
        .select('*')
        .eq('class_id', selectedClassId);
      return (data ?? []) as ClassMember[];
    },
    enabled: !!selectedClassId,
  });

  const memberIds = members.map((m) => m.user_id);

  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['member-profiles', memberIds],
    queryFn: async () => {
      if (memberIds.length === 0) return [] as Profile[];
      const { data } = await supabase.from('profiles').select('*').in('user_id', memberIds);
      return (data ?? []) as Profile[];
    },
    enabled: memberIds.length > 0,
  });

  const { data: memberMastery = [] } = useQuery({
    queryKey: ['member-mastery', memberIds],
    queryFn: async () => {
      if (memberIds.length === 0) return [] as StandardMastery[];
      const { data } = await supabase
        .from('standard_mastery')
        .select('*')
        .in('user_id', memberIds);
      return (data ?? []) as StandardMastery[];
    },
    enabled: memberIds.length > 0,
  });

  const createClassMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('classes')
        .insert({ educator_id: user.id, name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educator-classes'] });
      setShowCreate(false);
      setNewClassName('');
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', classId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educator-classes'] });
      setSelectedClassId(null);
    },
  });

  const handleShare = async (joinCode: string) => {
    try {
      await Share.share({
        message: `Join my financial literacy class with code: ${joinCode}`,
      });
    } catch {
      Alert.alert('Unable to share', 'Please copy the code manually.');
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const getMemberMasteryCount = (userId: string) =>
    memberMastery.filter((m) => m.user_id === userId && m.mastery_level >= 80).length;

  if (selectedClass) {
    return (
      <Screen>
        <View className="px-4 py-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to classes"
            onPress={() => setSelectedClassId(null)}
            className="flex-row items-center gap-1 mb-4 self-start py-2"
          >
            <ArrowLeft color="#676D76" size={16} />
            <Text className="text-sm text-muted-foreground">Back to classes</Text>
          </Pressable>

          <View className="bg-card rounded-2xl p-5 mb-4">
            <Text className="text-2xl font-bold text-foreground mb-1">{selectedClass.name}</Text>
            <Text className="text-sm text-muted-foreground mb-3">
              {members.length} {members.length === 1 ? 'student' : 'students'}
            </Text>
            <View className="flex-row items-center gap-2 bg-muted rounded-xl p-3">
              <Text className="font-mono text-lg text-foreground flex-1">
                {selectedClass.join_code}
              </Text>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => handleShare(selectedClass.join_code)}
                leftIcon={<Copy color="#1B2633" size={14} />}
              >
                Share
              </Button>
            </View>
          </View>

          <Text className="font-semibold text-foreground mb-3">Students</Text>
          {memberProfiles.length === 0 ? (
            <View className="bg-muted/50 rounded-2xl p-5 items-center">
              <Users color="#676D76" size={32} />
              <Text className="text-sm text-muted-foreground mt-2">
                No students have joined yet. Share the join code above.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {memberProfiles.map((p) => {
                const mastered = getMemberMasteryCount(p.user_id);
                return (
                  <View key={p.id} className="bg-card rounded-xl p-4 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="font-bold text-primary">
                        {(p.display_name ?? '?').slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-foreground">
                        {p.display_name ?? 'Student'}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {p.school ?? 'No school set'}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-bold text-foreground">
                        {mastered}/{TOTAL_STANDARDS}
                      </Text>
                      <Text className="text-xs text-muted-foreground">mastered</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View className="mt-6">
            <Button
              variant="destructive"
              onPress={() =>
                Alert.alert(
                  'Delete class?',
                  `This will remove ${selectedClass.name} and all its members.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteClassMutation.mutate(selectedClass.id),
                    },
                  ]
                )
              }
              leftIcon={<Trash2 color="white" size={14} />}
            >
              Delete class
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="px-4 py-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          className="flex-row items-center gap-1 mb-4 self-start py-2"
        >
          <ArrowLeft color="#676D76" size={16} />
          <Text className="text-sm text-muted-foreground">Back</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground mb-1">Educator Dashboard</Text>
        <Text className="text-sm text-muted-foreground mb-6">
          {profile?.display_name ? `Kia ora, ${profile.display_name}.` : 'Welcome.'}
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-semibold text-foreground">Your Classes</Text>
          <Button
            size="sm"
            onPress={() => setShowCreate(true)}
            leftIcon={<Plus color="white" size={14} />}
          >
            New
          </Button>
        </View>

        {showCreate && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-card rounded-2xl p-4 mb-4 gap-3"
          >
            <Input
              label="Class name"
              value={newClassName}
              onChangeText={setNewClassName}
              placeholder="e.g. Period 3 Financial Literacy"
            />
            <View className="flex-row gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  setShowCreate(false);
                  setNewClassName('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onPress={() => createClassMutation.mutate(newClassName.trim())}
                disabled={newClassName.trim().length === 0}
                loading={createClassMutation.isPending}
              >
                Create
              </Button>
            </View>
          </MotiView>
        )}

        {classes.length === 0 ? (
          <View className="bg-muted/50 rounded-2xl p-6 items-center">
            <Users color="#676D76" size={40} />
            <Text className="text-sm text-muted-foreground text-center mt-3">
              No classes yet. Create your first class to start inviting students.
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {classes.map((c, i) => (
              <MotiView
                key={c.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 60 }}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelectedClassId(c.id)}
                  className="bg-card rounded-2xl p-5 flex-row items-center justify-between"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{c.name}</Text>
                    <Text className="text-xs text-muted-foreground font-mono mt-0.5">
                      Join code: {c.join_code}
                    </Text>
                  </View>
                  <Users color="#676D76" size={18} />
                </Pressable>
              </MotiView>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
