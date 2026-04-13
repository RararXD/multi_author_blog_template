---
title: DeepTutor Deployment Experiences
date: 2026-03-14
author: rf
category: 技术
tags: English, DeepTutor, AI
cover: /images/deeptutor-deploy-cover.png
summary: Initially it was just a project discovered by someone who scrolled through GitHub...
---



It was an ordinary day when rrxd earned a lot of free tokens for her AI API.

> I've no idea on where to spend my tokens.
>
> I am thinking about deploying some kind of interesting open-source projects...
>
> ...and spend them all. :thinking:

Scrolling through GitHub projects... and we've got this:

https://github.com/HKUDS/DeepTutor

That's exactly what we are talking about - ~~a token killer~~ an interesting project to deploy. Maybe it's indeed useful when deployed. Who knows?

## Choosing an AI Model

Yes, rrxd's got the tokens, and it's time to spend them.

But... things became different after rrxd went to Claude. This guy is about to get a brand new MacBook Pro with the cutting-edge M5 Pro chip and 64GB of *Unified* RAM. Claude gave an idea of deploying a local AI model and make DeepTutor use that.

What a coincidence. I spent a lot of time playing with Ollama back in 2024. It's been a while since I last used that, and a number of new models got uploaded and became my new choices.

Before rrxd's new MacBook gets shipped, I decided to try this project myself. My current MacBook is definitely not a good place to do that. The AI models would eat up my 18GB RAM rapidly while still being stupid due to their pathetic parameters counts. I looked at another laptop at home. There we go.

Here's what I've got for testing DeepTutor with local AI:

- CPU: Intel i9-13900HX
- RAM: 64GB DDR5 4800MT/s
- GPU: NVIDIA RTX 4090 Laptop GPU (16GB VRAM)

It's rare to find Windows PCs with unified memory, and obviously the one at home is not an example. It's got a powerful GPU, but it is bottlenecked by the VRAM size and memory bandwidth when dealing with any model larger than 16GB. I tried `qwen3.5:35b`. With `Q4_K_M` quantization, its size was 23GB and some part of it will be dumped into RAM when running. I have to say that, Ollama seemed improved in the past two years - This model with 35 billion parameters could run at 15 tokens/s, about 5 times faster compared to back in 2024, even though not everything is loaded in VRAM.

*I wish I had an RTX 5090 so that this could run way faster with everything loaded in the 32GB VRAM.* (Daydreaming)

Also I tried `gpt-oss:20b`. This model could perfectly fit into my VRAM and was incredibly fast. On my hardware it could easily go beyond 100 tokens/s.

![gpt-oss running at 113 tokens/s](/images/deeptutor-deploy/gpt-response-speed.webp)

## Hallucinations?

Of course, rrxd also played with Ollama and grabbed a few models that could run on the 16GB RAM. As aforementioned, this guy hadn't received the new MacBook yet, so what this guy could do was to test small models on that limited RAM.

So rrxd started with small models like `qwen3.5:4b` and turned out that it simply knew too little. This model could only guess when being asked about very detailed and specific information, like,

> Give me an outline about Chapter 6 of Cambridge AS Level Biology.

Fortunately, Ollama has free search API for each account created, and the API rate limit refreshes every week. With web search, the models could do better as long as they could find quality sources.

For RAG, rrxd asked Claude to write a simple prototype to turn PDF documents into a database. I had no idea what Claude gave rrxd, but it looked working from what I knew from rrxd.

## Downloading and Installing DeepTutor

Now it's the real beginning of the project.

The target laptop was Windows 11 and was missing a lot of necessary tools. After all the laptop was not 100% owned by me anymore. I started from installing Python and node to make the project running. DeepTutor mentioned the feasibility of deploying in Docker, but since I wasn't familiar with that and this was just prototyping, I used Python virtual environment instead.

I used Python 3.12.10 and Node 24.14.0. Initially the Python I installed was the latest version (3.14) but there were compatibility issues with packages that required `Python < 3.14`.

The project repository came with a template for `.env` file named `.env.example`.

![Variables for LLM](/images/deeptutor-deploy/env-settings-llm.webp)

The parameters above were the ones required for LLM. Ollama supports OpenAI-styled API so this should work fine. The only difference was that, `LLM_API_KEY` was not required for Ollama and could be left blank.

After saving the file as `.env`, DeepTutor should have the basic AI functionality. The chat in the home page and smart solver should be working - and that was nothing different from directly chatting with Ollama models in a terminal.

It is important to note that functionalities like smart solving can cost more tokens than expected. Even simple questions like solving a differential equation of $\frac{\mathrm{d}y}{\mathrm{d}x} = x^2$ can cost more than 5,000 tokens. This time you don't spend money on the tokens, but the waiting time can be unacceptable if your model is too slow. I tested with the 35B Qwen model and it took literally minutes. It only became fine when I switched to GPT-OSS. So just choose something that balances speed and quality.

With no help of web search and databases, hallucination remained a problem. So my next step was, apparently,

## Web Search

Although Ollama provided web search functionality that came with its account, it did not seem to be open to external services. At least I did not find a way to use that with DeepTutor.

![Variables for web search](/images/deeptutor-deploy/env-settings-search.webp)

The env example provided a list of search API providers. The reason I chose Tavily was because it provided 1000 free searches every month, which was a great choice for just trying out this feature without heavy use.

This step went quite smooth - nothing wrong happened.

After that, it was time to import the textbooks and papers to the knowledge base, which is time to introduce...

## RAG and Embedding Models

The project provided a convenient way to test the knowledge base - they included a download link to a prebuilt knowledge base with the PDF files converted into vector database. I made use of the sample knowledge base, but it did not seem working. I didn't know why and I didn't really need to. Anyway I would be building my own knowledge base with my own documents.

I filled in the variables in the env file to make DeepTutor use the embedding model from Ollama. The model I chose was `qwen3-embedding` which featured 40K context and customizable dimensions count up to 4096. I chose 1536 to balance processing speed and performance.

In my first attempt, the knowledge base creation failed and the backend threw an error. The message printed by the backend suggested that the model did not exist, but I indeed installed the model and it was visible when running `ollama list`. From the error message, I looked at the source code and found that a status code of 404 was generated.

![How status code 404 was dealt with in source code](/images/deeptutor-deploy/source-code-404-solution.webp)

It seemed that whenever a 404 was generated, the program would consider it as a result of a missing model. But in this case, 404 was generated simply because the URL of the host was not correct. That was really a pitfall that I did not realize: Ollama uses a different URL for OpenAI-styled LLM API from the embedding model API. While LLMs are accessed via `localhost:11434/v1`, embedding models did not need that `v1` in the URL.

This was a small problem but at that time I thought it was the problem of the source code. Turned out that I was wrong and spent a lot of time in the wrong direction. Anyway, I was pleased to see the knowledge base finally created as expected in the end of the day at 3:30 am.

After the knowledge base generation was completed, the problem came to utilizing the knowledge base when the LLM generates an answer. In the log generated by backend, I saw an error pointing out that `OPENAI_API_KEY` was missing. As you can imagine, local models do not necessarily require any API keys - what this program needed was just a placeholder. Adding a placeholder like `OPENAI_API_KEY=1` in the env file solved that.

## After the Deployment

The web search and knowledge base were properly configured with the steps above, and it is time to see how this works out.

When asking some basic questions about the contents of the textbook provided, the model was able to respond and point out where in the document the reference was found.

We also tested question generation based on the textbook content. When testing with Cambridge AS and A Level Chemistry, it turned out that inaccuracy in the response remained an issue. The model used terminologies that were not covered in the textbook. This might be due to the insufficient size of the model, but another guess of mine was that the knowledge base was not set up properly. The input in the setup step was a PDF, where the arrangement of the contents on a page could cause the model to parse the contents in an unexpected way. There could be boxes, tables and multiple columns in a page that could cause the text to be interpreted in an incorrect order. We may need extra efforts to ensure the quality of RAG.

For the models, the one I used to test the project was `gpt-oss:20b` as aforementioned. rrxd hasn't received the new MacBook yet and on that new machine we will certainly be able to run larger models faster without the 16GB VRAM limit. We might instead be testing `qwen3.5:35b` and expect a higher output speed.

---

But wait, something seemed to be wrong - did I initially say that we wanted to spend spare free tokens?