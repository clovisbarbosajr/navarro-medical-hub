
-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat-files bucket
CREATE POLICY "Anyone can view chat files" ON storage.objects FOR SELECT USING (bucket_id = 'chat-files');
CREATE POLICY "Authenticated users can upload chat files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own chat files" ON storage.objects FOR DELETE USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
