import earthaccess

print("Authenticating with NASA Earthdata Login...")

# This command will check for your auth files.
# If they don't exist, it will prompt you to enter your credentials.
auth = earthaccess.login(strategy="interactive", persist=True)

if auth:
    print("✅ Success! Your authentication files (.netrc and .dodsrc) have been created in your home directory.")
else:
    print("❌ Authentication failed. Please check your credentials and try again.")