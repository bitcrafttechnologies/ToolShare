import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Spinner } from '@/components/ui';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { createMessageRepository } from '@toolshare/supabase';
import type { Message } from '@toolshare/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export default function ChatScreen() {
  const { id: bookingId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const repo = createMessageRepository(supabase);

  useEffect(() => {
    repo.getMessages(bookingId).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    const unsubscribe = repo.subscribeToMessages(bookingId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return unsubscribe;
  }, [bookingId]);

  async function send() {
    if (!text.trim() || !user) return;
    const content = text.trim();
    setText('');
    try {
      const msg = await repo.sendMessage(bookingId, user.id, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setText(content);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMe = item.sender_id === user?.id;
          return (
            <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
              <View
                className={`max-w-xs rounded-2xl px-4 py-3 ${
                  isMe ? 'bg-primary-500' : 'bg-gray-100'
                }`}
              >
                {!isMe && (
                  <Text className="mb-1 text-xs font-medium text-gray-500">
                    {item.sender?.display_name}
                  </Text>
                )}
                <Text className={isMe ? 'text-white' : 'text-gray-900'}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />

      <View className="flex-row gap-2 border-t border-gray-200 px-4 py-3">
        <TextInput
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base"
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          className="rounded-xl bg-primary-500 px-5 py-3"
          onPress={send}
          disabled={!text.trim()}
        >
          <Text className="font-semibold text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
