import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GITHUB_TOKEN = process.env.GITHUB_PAT;

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GITHUB_PAT is not set' });
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const owner = 'andgu0704';
    const repo = 'OnyxInvoice';
    const path = 'data/companies.json';

    try {
        const { companies } = req.body;

        if (!Array.isArray(companies)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // 1. Get current file SHA
        let sha = '';
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            // @ts-ignore
            sha = data.sha;
        } catch (err: any) {
            if (err.status !== 404) throw err;
        }

        // 2. Format content as base64 string
        const content = Buffer.from(JSON.stringify(companies, null, 2)).toString('base64');

        // 3. Update the file
        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: 'Update companies.json via API',
            content,
            sha: sha || undefined,
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('GitHub API Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to update GitHub' });
    }
}
