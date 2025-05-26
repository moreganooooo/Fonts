import fetch from "node-fetch";
import { JobServiceClient } from "@google-cloud/talent";

export const config = {
  api: { bodyParser: true }
};

const GOOGLE_CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
const googleClient = new JobServiceClient({ credentials: GOOGLE_CREDENTIALS });

export default async function handler(req, res) {
  const { keyword = "", location = "", remote = true } = req.body;

  try {
    const remotiveQuery = new URLSearchParams({ search: keyword, limit: 10 });
    const remotiveRes = await fetch(`https://remotive.io/api/remote-jobs?${remotiveQuery}`);
    const remotiveData = await remotiveRes.json();
    const remotiveJobs = remotiveData.jobs
      .filter(job => location ? job.candidate_required_location.toLowerCase().includes(location.toLowerCase()) : true)
      .slice(0, 10)
      .map(job => ({
        source: "Remotive",
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location,
        url: job.url,
        tags: job.tags
      }));

    const arbeitnowRes = await fetch("https://www.arbeitnow.com/api/job-board-api");
    const arbeitnowData = await arbeitnowRes.json();
    const arbeitnowJobs = arbeitnowData.data
      .filter(job => {
        const matchKeyword = keyword ? (job.title + " " + job.description).toLowerCase().includes(keyword.toLowerCase()) : true;
        const matchLocation = location ? job.location.toLowerCase().includes(location.toLowerCase()) : true;
        const matchRemote = remote ? job.remote === true : true;
        return matchKeyword && matchLocation && matchRemote;
      })
      .slice(0, 10)
      .map(job => ({
        source: "Arbeitnow",
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        tags: job.tags || []
      }));

    const projectId = GOOGLE_CREDENTIALS.project_id;
    const tenantId = "default";
    const request = {
      parent: googleClient.tenantPath(projectId, tenantId),
      requestMetadata: {
        userId: "test-user",
        sessionId: "test-session",
        domain: "gpt-docs.ai"
      },
      jobQuery: {
        query: keyword,
        locationFilters: location ? [{ address: location }] : []
      }
    };

    let googleJobs = [];
    try {
      const [response] = await googleClient.searchJobs(request);
      googleJobs = response.map(job => ({
        source: "GoogleTalent",
        title: job.jobTitle,
        company: job.companyDisplayName,
        location: job.addresses?.[0] || "N/A",
        url: job.applicationInfo?.uris?.[0] || "N/A",
        tags: job.customAttributes ? Object.keys(job.customAttributes) : []
      }));
    } catch (googleErr) {
      console.error("Google job fetch failed", googleErr.message);
    }

    const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...googleJobs];
    res.status(200).json({ jobs: allJobs });
  } catch (err) {
    console.error("Job search error:", err);
    res.status(500).json({ error: err.message });
  }
}
