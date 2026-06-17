const fs = require('fs');

async function test() {
  const browseId = 'UCMZXFhRIef6VDjgmG9-GUaw';
  const body = {
    context: {
      client: {
        clientName: "WEB_REMIX",
        clientVersion: "1.20250310.01.00",
        hl: "en",
        gl: "US",
        visitorData: "CgtsZG1ySnZiQWtSbyiMjuGSBg%3D%3D"
      },
      request: {
        internalExperimentFlags: [],
        useSsl: true
      }
    },
    browseId: browseId
  };

  const res = await fetch('https://music.youtube.com/youtubei/v1/browse', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Goog-Api-Format-Version': '1',
      'X-YouTube-Client-Name': '67',
      'X-YouTube-Client-Version': '1.20250310.01.00',
      'X-Origin': 'https://music.youtube.com',
      'Referer': 'https://music.youtube.com/'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  fs.writeFileSync('artist_response.json', JSON.stringify(data, null, 2));
  console.log("Written artist_response.json");
}

test();
