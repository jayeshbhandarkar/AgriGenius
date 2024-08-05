import requests
import PyPDF2
from itertools import chain
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings

# Function to fetch content from a website
def fetch_website_content(url):
    response = requests.get(url)
    return response.text

# Function to extract text from a PDF file
def extract_pdf_text(pdf_file):
    with open(pdf_file, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

# Split the combined content into smaller chunks
def split_text(text, chunk_size=500, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    chunks = text_splitter.split_text(text)
    return chunks

# Initialize embeddings and vector store
def initialize_vector_store(contents):
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    web_chunks = list(chain.from_iterable(split_text(content) for content in contents))
    db = Chroma.from_texts(web_chunks, embedding_function)
    return db
