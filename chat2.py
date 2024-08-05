from langchain_together import Together
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Initialize the language model
llm = Together(
    model="meta-llama/Llama-2-70b-chat-hf",
    max_tokens=512,
    temperature=0.1,
    top_k=1,
    together_api_key="YOUR_Together_API_KEY"
)

# Set up the retrieval QA chain
def setup_retrieval_qa(db):
    retriever = db.as_retriever(similarity_score_threshold=0.6)

    # Define the prompt template
    prompt_template = """ Your name is AgriGenius, Please answer questions related to Agriculture. Try explaining in simple words. Answer in less than 100 words. If you don't know the answer, simply respond with 'Don't know.'
     CONTEXT: {context}
     QUESTION: {question}"""

    PROMPT = PromptTemplate(template=f"[INST] {prompt_template} [/INST]", input_variables=["context", "question"])

    # Initialize the RetrievalQA chain
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type='stuff',
        retriever=retriever,
        input_key='query',
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT},
        verbose=True
    )
    return chain
