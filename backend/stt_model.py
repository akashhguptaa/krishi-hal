import requests
url = "https://api.sarvam.ai/speech-to-text-translate"

payload = {'model': 'saaras:v1',
'prompt': ''}
files=[
('file',('1719_hi.wav',open('/Users/adityam/Downloads/hindiAudiosTest/hi/1719_hi.wav','rb'),'audio/wav'))
]
headers = {
'api-subscription-key': '000'
}

response = requests.request("POST", url, headers=headers, data=payload, files=files)

print(response.text)