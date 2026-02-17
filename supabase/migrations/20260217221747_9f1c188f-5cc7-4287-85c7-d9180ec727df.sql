
-- 1. Tabela de conversas
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct',
  name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de participantes
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de mensagens
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  is_attention BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de reações
CREATE TABLE public.chat_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

-- 5. Tabela de perfis de usuário para o chat
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Geral',
  avatar_url TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ,
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Tabela de departamentos
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#14b8a6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- ═══ FUNÇÕES AUXILIARES ═══

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_participants WHERE conversation_id = _conversation_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(_user_id UUID)
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT conversation_id FROM public.chat_participants WHERE user_id = _user_id;
$$;

-- ═══ RLS POLICIES ═══

-- chat_conversations
CREATE POLICY "Members can view conversations" ON public.chat_conversations FOR SELECT USING (id IN (SELECT public.get_user_conversation_ids(auth.uid())));
CREATE POLICY "Authenticated users can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Members can update conversations" ON public.chat_conversations FOR UPDATE USING (public.is_conversation_member(id, auth.uid()));

-- chat_participants
CREATE POLICY "Members can view participants" ON public.chat_participants FOR SELECT USING (conversation_id IN (SELECT public.get_user_conversation_ids(auth.uid())));
CREATE POLICY "Authenticated users can add participants" ON public.chat_participants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- chat_messages
CREATE POLICY "Members can view messages" ON public.chat_messages FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "Members can send messages" ON public.chat_messages FOR INSERT WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()) AND sender_id = auth.uid());
CREATE POLICY "Senders can update messages" ON public.chat_messages FOR UPDATE USING (sender_id = auth.uid());
CREATE POLICY "Senders can delete messages" ON public.chat_messages FOR DELETE USING (sender_id = auth.uid());

-- chat_reactions
CREATE POLICY "Members can view reactions" ON public.chat_reactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.id = message_id AND public.is_conversation_member(m.conversation_id, auth.uid()))
);
CREATE POLICY "Members can add reactions" ON public.chat_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own reactions" ON public.chat_reactions FOR DELETE USING (user_id = auth.uid());

-- user_profiles
CREATE POLICY "Anyone can view profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Authenticated can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- departments
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments insert" ON public.departments FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can manage departments update" ON public.departments FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can manage departments delete" ON public.departments FOR DELETE USING (public.is_admin());

-- ═══ REALTIME ═══
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;

-- ═══ TRIGGER updated_at ═══
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
