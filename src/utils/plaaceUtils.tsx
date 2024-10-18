// Function to check if the script tag is hosted on the specified URL
export function isScriptHostedOn(urlFragment: string): boolean {
  return window.location.href.includes(urlFragment);
}

// Function to get the value of a specific cookie by name
export function getCookieValue(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length);
    }
  }
  return null;
}

// Function to fetch the account document using token_jwt
export async function fetchAccountDocument(token: string): Promise<string> {
  const response = await fetch('https://plaace-platform-git-midpilot-test.plaace.dev/account', {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Cookie': `token_jwt=${token}`,
    },
    credentials: 'include',
  });
  if (response.ok) {
    return await response.text();
  } else {
    throw new Error('Failed to fetch account document');
  }
}

// Function to extract the email from the account document using regex
export function extractEmail(accountDocument: string): string | null {
  const emailRegex = /"email"\s*:\s*"([^"]+)"/;
  const match = accountDocument.match(emailRegex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Function to check if the email is whitelisted by querying the API endpoint
async function isEmailWhitelisted(email: string): Promise<boolean> {
  const response = await fetch('https://midpilot-call-server-434813.ew.r.appspot.com/api/is_whitelisted', {
//   const response = await fetch('http://localhost:8080/api/is_whitelisted', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin: 'plaace',
      email: email,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.whitelisted === true;
  } else {
    console.error('Error checking whitelist status:', response.statusText);
    return false;
  }
}

// Main function to perform all checks
export async function checkUserAccess(params: { allowAll: boolean }): Promise<boolean> {
  const token = getCookieValue('token_jwt');
  if (params.allowAll) {
    console.log("Allowing")
    return true;
  }
  if (!token) {
    return false;
  }

  try {
    const accountDocument = await fetchAccountDocument(token);
    const email = extractEmail(accountDocument);
    if (!email) {
      return false;
    }

    return await isEmailWhitelisted(email);
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}
