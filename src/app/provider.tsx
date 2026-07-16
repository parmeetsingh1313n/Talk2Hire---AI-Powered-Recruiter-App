"use client"
import React, { useContext, useEffect, useState } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { UserDetailContext } from '../../context/UserDetailContext';
import { supabase } from '../../services/supabaseClient';

function Provider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<any>(null);
    // Clerk is the source of truth for authentication.
    const { user: clerkUser, isLoaded } = useClerkUser();

    useEffect(() => {
        if (!isLoaded) return;
        if (clerkUser) {
            CreateNewUser();
        } else {
            setUser(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, clerkUser?.id]);

    const CreateNewUser = async () => {
        // Pull identity from Clerk, mapped to the same shape the app already uses.
        const email = clerkUser?.primaryEmailAddress?.emailAddress;
        const name = clerkUser?.fullName || clerkUser?.firstName || 'User';
        const picture = clerkUser?.imageUrl;

        if (!email) return;

        // Check if user exists in the Supabase Users table (still our database).
        const { data: Users } = await supabase
            .from('Users')
            .select("*")
            .eq('email', email);

        // If not, create a new user row.
        if (Users?.length === 0) {
            const { data } = await supabase.from('Users').insert([
                { email, name, picture }
            ]).select();

            if (data && data.length > 0) {
                setUser(data[0]);
            }
            return;
        }

        if (Users && Users.length > 0) {
            const existing = Users[0];
            // Backfill name/picture if the stored row is missing them.
            if (!existing.name || !existing.picture) {
                const { data } = await supabase
                    .from('Users')
                    .update({ name, picture })
                    .eq('email', email)
                    .select();
                setUser(data && data.length > 0 ? data[0] : existing);
                return;
            }
            setUser(existing);
        }
    }

    return (
        <div>
            <UserDetailContext.Provider value={{ user, setUser }}>
                {children}
            </UserDetailContext.Provider>
        </div>
    )
}

export default Provider


export const useUser = () => {
    const context = useContext(UserDetailContext);
    return context;
}
