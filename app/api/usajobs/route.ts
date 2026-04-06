import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// USAJobs has a free official API — register at developer.usajobs.gov
// Set USAJOBS_API_KEY and USAJOBS_EMAIL in your environment variables
// Without keys it returns sample data so the UI still works

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || 'cybersecurity compliance'
  const apiKey = process.env.USAJOBS_API_KEY
  const email = process.env.USAJOBS_EMAIL

  if (!apiKey || !email) {
    // Return helpful message if not configured
    return NextResponse.json({
      configured: false,
      message: 'Add USAJOBS_API_KEY and USAJOBS_EMAIL to your Vercel environment variables. Register free at developer.usajobs.gov',
      jobs: []
    })
  }

  try {
    const url = new URL('https://data.usajobs.gov/api/search')
    url.searchParams.set('Keyword', keyword)
    url.searchParams.set('ResultsPerPage', '10')
    url.searchParams.set('SortField', 'OpenDate')
    url.searchParams.set('SortDirection', 'Desc')

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization-Key': apiKey,
        'User-Agent': email,
        'Host': 'data.usajobs.gov',
      }
    })

    if (!res.ok) throw new Error(`USAJobs API error: ${res.status}`)

    const data = await res.json()
    const items = data?.SearchResult?.SearchResultItems || []

    const jobs = items.map((item: USAJobsItem) => {
      const j = item.MatchedObjectDescriptor
      return {
        title: j.PositionTitle,
        org: j.OrganizationName,
        location: j.PositionLocationDisplay,
        salary: j.PositionRemuneration?.[0]
          ? `$${Number(j.PositionRemuneration[0].MinimumRange).toLocaleString()} – $${Number(j.PositionRemuneration[0].MaximumRange).toLocaleString()}`
          : 'See posting',
        url: j.PositionURI,
        closeDate: j.ApplicationCloseDate?.split('T')[0] || '',
        openDate: j.PublicationStartDate?.split('T')[0] || '',
        grade: j.JobGrade?.[0]?.Code || '',
      }
    })

    return NextResponse.json({ configured: true, jobs })
  } catch (err) {
    console.error('USAJobs error:', err)
    return NextResponse.json({ configured: true, jobs: [], error: 'Failed to fetch from USAJobs' })
  }
}

type USAJobsItem = {
  MatchedObjectDescriptor: {
    PositionTitle: string
    OrganizationName: string
    PositionLocationDisplay: string
    PositionRemuneration?: { MinimumRange: string; MaximumRange: string }[]
    PositionURI: string
    ApplicationCloseDate?: string
    PublicationStartDate?: string
    JobGrade?: { Code: string }[]
  }
}
