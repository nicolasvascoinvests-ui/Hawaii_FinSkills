import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Award, Download, Check } from 'lucide-react-native';
import Button from './Button';
import {
  CERTIFICATE_ISSUER,
  shareCertificatePdf,
  type CertificateData,
} from '../lib/certificate';

interface LessonCertificateProps {
  learnerName: string;
  courseTitle: string;
  standards?: string[];
  completedAt?: Date;
}

export default function LessonCertificate({
  learnerName,
  courseTitle,
  standards,
  completedAt,
}: LessonCertificateProps) {
  const issuedAt = completedAt ?? new Date();
  const [downloaded, setDownloaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data: CertificateData = {
        learnerName,
        courseTitle,
        standards,
        completedAt: issuedAt,
      };
      await shareCertificatePdf(data);
      setDownloaded(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not generate certificate.';
      Alert.alert('Certificate error', msg);
    } finally {
      setBusy(false);
    }
  };

  const dateLabel = issuedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 200 }}
      className="w-full mb-4"
    >
      <View
        className="rounded-2xl border-2 border-amber-500/40 bg-amber-50 p-5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <Award color="#D97706" size={18} />
          <Text className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Certificate of Completion
          </Text>
        </View>

        <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Awarded to
        </Text>
        <Text className="text-xl font-bold text-foreground mb-3">{learnerName}</Text>

        <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
          For completing with 100% accuracy
        </Text>
        <Text className="text-lg font-bold text-foreground">{courseTitle}</Text>

        {standards && standards.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {standards.map((code) => (
              <View key={code} className="bg-primary/10 rounded-full px-2 py-0.5">
                <Text className="text-xs text-primary font-mono">{code}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="flex-row justify-between items-end mt-4 pt-3 border-t border-border">
          <View>
            <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Issued by
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {CERTIFICATE_ISSUER}
            </Text>
          </View>
          <View>
            <Text className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">
              Date awarded
            </Text>
            <Text className="text-sm font-semibold text-foreground text-right">
              {dateLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-3">
        <Button
          onPress={handleDownload}
          disabled={busy}
          variant={downloaded ? 'secondary' : 'primary'}
          leftIcon={
            downloaded ? (
              <Check color={downloaded ? '#1B2633' : 'white'} size={16} />
            ) : (
              <Download color="white" size={16} />
            )
          }
        >
          {busy
            ? 'Preparing PDF…'
            : downloaded
              ? 'Downloaded — share again'
              : 'Download certificate (PDF)'}
        </Button>
      </View>
    </MotiView>
  );
}
