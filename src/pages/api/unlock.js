export const prerender = false;

export async function POST({ request }) {
    try {
        // Get the request body text first
        const body = await request.text();
        console.log('Raw request body:', body);
        
        if (!body) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Empty request body' 
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        const { code } = JSON.parse(body);
        
        // Get the secret from environment variables
        const secretCode = import.meta.env.UNLOCK_SECRET || process.env.UNLOCK_SECRET;
        console.log('Secret configured:', !!secretCode);
        
        if (!secretCode) {
            console.error('UNLOCK_SECRET not configured');
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Server configuration error' 
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Check if the provided code matches the secret
        const isValid = code === secretCode;
        console.log('Code validation:', { provided: code, valid: isValid });
        
        return new Response(JSON.stringify({ 
            success: isValid,
            message: isValid ? 'Unlock successful' : 'Invalid code'
        }), {
            status: isValid ? 200 : 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Unlock API error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid request: ' + error.message 
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}