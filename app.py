# app.py
from flask import Flask, render_template, request, jsonify
from chat1 import fetch_website_content, extract_pdf_text, initialize_vector_store
from chat2 import llm, setup_retrieval_qa

app = Flask(__name__)

# Example URLs and PDF files
urls = ["https://mospi.gov.in/4-agricultural-statistics"]   #"https://desagri.gov.in/",
pdf_files = ["Data/Farming Schemes.pdf", "Data/farmerbook.pdf"]

# Fetch content from websites
website_contents = [fetch_website_content(url) for url in urls]

# Extract text from PDF files
pdf_texts = [extract_pdf_text(pdf_file) for pdf_file in pdf_files]

# Combine all content into chunks
all_contents = website_contents + pdf_texts

# Initialize the vector store
db = initialize_vector_store(all_contents)

# Set up the RetrievalQA chain
chain = setup_retrieval_qa(db)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    query = request.form['messageText'].strip().lower()

    if query in ["who developed you?", "who created you?", "who made you?"]:
        return jsonify({"answer": "I was developed by Jayesh Bhandarkar."})
    
    response = chain(query)
    return jsonify({"answer": response['result']})

if __name__ == "__main__":
    app.run(debug=True)
