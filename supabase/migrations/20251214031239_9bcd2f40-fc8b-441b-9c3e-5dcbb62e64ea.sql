-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  location_city TEXT,
  location_country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prayer_logs table
CREATE TABLE public.prayer_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_name TEXT NOT NULL,
  prayer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fasting_logs table
CREATE TABLE public.fasting_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fast_date DATE NOT NULL,
  fast_type TEXT NOT NULL DEFAULT 'obligatory',
  suhoor_time TIMESTAMP WITH TIME ZONE,
  iftar_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zakat_records table
CREATE TABLE public.zakat_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  zakat_type TEXT NOT NULL,
  recipient TEXT,
  paid_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quran_progress table
CREATE TABLE public.quran_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for AI assistant
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for prayer_logs
CREATE POLICY "Users can view their own prayer logs" ON public.prayer_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prayer logs" ON public.prayer_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prayer logs" ON public.prayer_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prayer logs" ON public.prayer_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for fasting_logs
CREATE POLICY "Users can view their own fasting logs" ON public.fasting_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fasting logs" ON public.fasting_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fasting logs" ON public.fasting_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fasting logs" ON public.fasting_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for zakat_records
CREATE POLICY "Users can view their own zakat records" ON public.zakat_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own zakat records" ON public.zakat_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own zakat records" ON public.zakat_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own zakat records" ON public.zakat_records FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for quran_progress
CREATE POLICY "Users can view their own quran progress" ON public.quran_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quran progress" ON public.quran_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quran progress" ON public.quran_progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for chat_messages (allow anonymous access for AI chat)
CREATE POLICY "Anyone can view their own chat messages" ON public.chat_messages FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Create trigger for profiles on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();