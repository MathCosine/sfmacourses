-- Profile pictures: store the uploaded avatar's Cloudinary URL on the profile.
-- Run this once in the Supabase SQL editor.

alter table profiles add column if not exists avatar_url text;
