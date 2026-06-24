async function test() {
  const apiKey = 'AIzaSyBA_u5h_tZh6_gxgoA4Ar1Wr6wmiWOhpiQ';
  try {
    const signupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email: 'test_12345_clns2@gmail.com', password: 'password123', returnSecureToken: true})
    });
    const signupData = await signupRes.json();
    console.log('Signup Data:', signupData);
    const idToken = signupData.idToken;
  
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({requestType: 'VERIFY_EMAIL', idToken: idToken})
    });
    const data = await res.json();
    console.log('OOB Data:', data);
    
    await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({idToken: idToken})
    });
  } catch(e) {
    console.log(e);
  }
}
test();
