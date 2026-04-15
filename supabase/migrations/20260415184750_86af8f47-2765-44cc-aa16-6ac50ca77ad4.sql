
-- ============================================
-- INITIAL SCHEMA: AI-Powered Hiring Platform
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles table (candidates)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  bio text,
  about text,
  avatar_url text,
  cover_url text,
  location text,
  github_url text,
  leetcode_url text,
  kaggle_url text,
  portfolio_url text,
  currently_learning text,
  open_to_work boolean DEFAULT false,
  seeking_type text,
  work_mode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table (HR)
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  description text,
  industry text,
  logo_url text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  job_type text DEFAULT 'full-time',
  work_mode text DEFAULT 'onsite',
  requirements jsonb,
  github_requirement jsonb,
  kaggle_requirement jsonb,
  leetcode_requirement jsonb,
  priority_order jsonb,
  ats_config jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidates table (denormalized view for HR)
CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  bio text,
  about text,
  avatar_url text,
  github_url text,
  leetcode_url text,
  kaggle_url text,
  skills text[],
  experience jsonb,
  education jsonb,
  projects jsonb,
  created_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'applied',
  ats_score numeric,
  rank numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  is_read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  role text,
  department text,
  status text DEFAULT 'active',
  avatar_url text,
  joined_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Employee requests table
CREATE TABLE public.employee_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text,
  department text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HR members table
CREATE TABLE public.hr_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  role text,
  status text DEFAULT 'active',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Education table
CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school text NOT NULL,
  degree text,
  field_of_study text,
  start_date text,
  end_date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Experience table
CREATE TABLE public.experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  description text,
  location text,
  start_date text,
  end_date text,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_link text,
  tech_stack text[],
  start_date text,
  end_date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  issuer text,
  issue_date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table (per user)
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'general',
  proficiency integer DEFAULT 50,
  source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Learning goals table
CREATE TABLE public.learning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  link text,
  proof_url text,
  completed boolean DEFAULT false,
  deadline text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Streaks table (platform activity tracking)
CREATE TABLE public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  streak_days integer DEFAULT 0,
  total_contributions integer DEFAULT 0,
  weekly_contributions integer DEFAULT 0,
  today_contributions integer DEFAULT 0,
  active_days integer DEFAULT 0,
  last_fetched_at timestamptz DEFAULT now(),
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Candidate ranks table
CREATE TABLE public.candidate_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  skill_score numeric DEFAULT 0,
  streak_score numeric DEFAULT 0,
  consistency_score numeric DEFAULT 0,
  final_rank numeric DEFAULT 0,
  rank_position integer,
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_ranks ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "HR can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE user_id = auth.uid())
);

-- Companies
CREATE POLICY "Company owner can manage" ON public.companies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can read companies" ON public.companies FOR SELECT USING (auth.role() = 'authenticated');

-- Jobs
CREATE POLICY "Company can manage own jobs" ON public.jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = jobs.company_id AND user_id = auth.uid())
);
CREATE POLICY "All authenticated can read jobs" ON public.jobs FOR SELECT USING (auth.role() = 'authenticated');

-- Candidates
CREATE POLICY "All authenticated can read candidates" ON public.candidates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can upsert own candidate record" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update candidate record" ON public.candidates FOR UPDATE USING (true);

-- Applications
CREATE POLICY "Users can insert applications" ON public.applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can read applications" ON public.applications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update applications" ON public.applications FOR UPDATE USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "All authenticated can read notifications" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (auth.role() = 'authenticated');

-- Employees
CREATE POLICY "Company can manage employees" ON public.employees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = employees.company_id AND user_id = auth.uid())
);

-- Employee requests
CREATE POLICY "Company can manage requests" ON public.employee_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = employee_requests.company_id AND user_id = auth.uid())
);

-- HR members
CREATE POLICY "Company can manage HR" ON public.hr_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = hr_members.company_id AND user_id = auth.uid())
);

-- User-owned tables
CREATE POLICY "Users manage own education" ON public.education FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own experience" ON public.experience FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own certificates" ON public.certificates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own skills" ON public.skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own learning_goals" ON public.learning_goals FOR ALL USING (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "HR can read all streaks" ON public.streaks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE user_id = auth.uid())
);

-- Candidate ranks
CREATE POLICY "Users read own rank" ON public.candidate_ranks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rank" ON public.candidate_ranks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "HR can read all ranks" ON public.candidate_ranks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE user_id = auth.uid())
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role') = 'candidate' THEN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.experience FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.learning_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.candidate_ranks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
