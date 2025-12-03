"use client"
import React, { useContext, useEffect, useState } from 'react';
import { UserDetailContext } from '../../context/UserDetailContext';
import { supabase } from '../../services/supabaseClient';

function Provider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        CreateNewUser();
    }, [])
    const CreateNewUser = () => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            // Check if user exists
            let { data: Users, error } = await supabase
                .from('Users')
                .select("*")
                .eq('email', user?.email)

            console.log(Users)
            //if not create a new user
            if (Users?.length === 0) {
                const { data, error } = await supabase.from('Users').insert([
                    {
                        email: user?.email,
                        name: user?.user_metadata?.name,
                        picture: user?.user_metadata?.picture,
                    }
                ]);
                console.log(data);
                setUser(data);
                return;
            }
            if (Users && Users.length > 0) {
                setUser(Users[0]);
            }
        });
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