import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export default function Select({
  label,
  value,
  placeholder = 'Select...',
  options,
  onChange,
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="w-full">
      {label && <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityHint="Opens a list of options"
        onPress={() => setOpen(true)}
        className={`h-12 px-4 rounded-xl border border-border bg-card flex-row items-center justify-between ${error ? 'border-destructive' : ''}`}
      >
        <Text className={selected ? 'text-foreground text-base' : 'text-muted-foreground text-base'}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown color="#676D76" size={18} />
      </Pressable>
      {error ? <Text className="text-destructive text-xs mt-1">{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setOpen(false)}>
          <Pressable
            className="bg-card rounded-t-3xl max-h-[70%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-4 border-b border-border">
              <View className="w-12 h-1 bg-muted-foreground/30 rounded-full self-center mb-3" />
              <Text className="text-center font-semibold text-foreground">{label ?? 'Select'}</Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="px-5 py-4 flex-row items-center justify-between active:bg-muted"
                  >
                    <Text className="text-foreground text-base">{item.label}</Text>
                    {isSelected && <Check color="#0B5E8C" size={18} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
