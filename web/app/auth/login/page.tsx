'use client';

import { getProviders, signIn, getCsrfToken } from "next-auth/react"

import { useState, useEffect } from "react";


export default function LoginPage() {
    const [providers, setProviders] = useState<any>(null)
    const [csrfToken, setCsrfToken] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        getCsrfToken().then(token => setCsrfToken(token ? token : null))
        getProviders().then(setProviders);
    }, [])

    if (!providers) {
        return <p>Loading...</p>;
    }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     await signIn("credentials", {
    //         email,
    //         password,
    //         callbackUrl: "/dashboard",
    //     })
    // }

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2 py-10">
            <section className="flex flex-col px-4 md:px-10">
                <a href="/" className="flex items-center gap-2 text-blue-400 font-semibold text-xl mb-10">
                    <img src="/calendar.svg" alt="Calendar icon" width={32} height={32} />
                    Smart Schedule
                </a>
                <div className="flex flex-col grow justify-center w-full max-w-[512px] mx-auto">
                    <h1 className="text-center md:text-left text-2xl md:text-3xl font-semibold mb-3">Logowanie</h1>
                    <p className="text-center md:text-left text-[#313131] mb-9">Zaloguj się, aby zarządzać powiadomieniami w salach</p>
                    {Object.values(providers).map((provider: any) => {
                        if (provider.name == 'USOS') {
                            return (
                                <button
                                    key={provider.id}
                                    onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                                    className="btn-usos"
                                >
                                    <img src="/usos-logo.png" alt="Usos icon" width={32} height={32} />
                                    Zaloguj się przez {provider.name}
                                </button>
                            );
                        }
                    })}
                    <div className="my-10 flex text-[#989898] items-center text-sm gap-4">
                        <hr className="grow bg-[#D0D5DD]" />
                        Lub zaloguj się przez
                        <hr className="grow bg-[#D0D5DD]" />
                    </div>
                    <form method="post" action="/api/auth/callback/credentials" className="">
                        <input name="csrfToken" type="hidden" defaultValue={csrfToken || ''} />
                        <input name="callbackUrl" type="hidden" value="/dashboard"/>

                        <label className="mb-1 block font-medium">Email</label>
                        <input required={true} type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="form-control mb-6" />

                        <label className="mb-1 block font-medium">Hasło</label>
                        <input required={true} type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="form-control mb-10" />
                        <button type="submit" className="btn-primary w-full">Zaloguj się</button>
                    </form>
                </div>
            </section>

            <section className="px-10 hidden lg:block">
                <div className="bg-gray-100 h-full rounded-[30px] flex items-center justify-center p-8">
                    <img src="/schedule-illustration.svg" alt="Calendar illustration" className="w-full h-auto" />
                </div>
            </section>
        </div>
    );
}