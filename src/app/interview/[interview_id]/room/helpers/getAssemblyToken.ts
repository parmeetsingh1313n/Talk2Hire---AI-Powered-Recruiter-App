export async function getAssemblyToken(): Promise<string> {
    try {
        console.log('Fetching AssemblyAI token...');

        const response = await fetch('/api/assemblyToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Token response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Failed to get token: ${response.status} ${response.statusText}. ${errorData.error}`);
        }

        const data = await response.json();

        if (!data.token) {
            console.error('No token in response:', data);
            throw new Error('No token received from server');
        }

        console.log('Successfully received AssemblyAI token');
        return data.token;

    } catch (error: any) {
        console.error('Error in getAssemblyToken:', error);
        throw new Error(`Failed to get AssemblyAI token: ${error.message}`);
    }
}