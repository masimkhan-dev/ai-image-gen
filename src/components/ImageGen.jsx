import { useState, useCallback } from "react";
import { Buffer } from "buffer"; // Import the Buffer polyfill
import "./ImageGen.css";
import { client, GenerationStyle, Status } from "imaginesdk";
import defaultImage from "../assets/defaultimage.jpg"; // Correctly import the default image

const API_KEY = "vk-gSB3Jbuc2DYgq2kyYjXZBInMhoePO0IVeXiMymJ7wOhXCmh";
const DEFAULT_IMAGE = defaultImage; // Use the imported default image

window.Buffer = Buffer; // Make Buffer globally available

const imagine = client(API_KEY);

export const ImageGen = () => {
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }


    setIsLoading(true);
    setError("");

    try {
      console.log("Sending request to Imagine AI Art Generator API...");
      const response = await imagine.generations(prompt, {
        style: GenerationStyle.IMAGINE_V5,
      });

      console.log("Response status:", response.status());

      if (response.status() === Status.OK) {
        const image = response.getOrThrow();
        console.log("API response received successfully");

        const imageSrc = await image.asImageSrc();
        setImageUrl(imageSrc);
      } else {
        const errorDetails = response.errorOrThrow();
        throw new Error(`API Error: ${errorDetails}`);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError(
        `Failed to generate image: ${error.message}. Please try again or check the console for more details.`
      );
      setImageUrl(DEFAULT_IMAGE);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "generated-image.png"; // Set the default file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this AI-generated image!",
          text: `Here's an image generated based on the prompt: "${prompt}"`,
          url: imageUrl,
        })
        .then(() => console.log("Image shared successfully"))
        .catch((error) => console.error("Error sharing the image:", error));
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        AI Image{" "}
        <span style={{ color: "#DD3C7C" }} className="text-pink-600 cursor-pointer">
          Generator
        </span>
      </h1>

      <div className="relative w-full aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Generated content"
          className="w-full h-full object-cover"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div style={{ maxWidth: "1200px", height: "50px" }} className="flex w-full max-w-md gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            outline: "none",
            boxShadow: "rgba(3, 102, 214, 0.3) 0px 0px 0px 3px",
            backgroundColor: "#010201",
            color: "white"
          }}
        />

        <button className="button-gen" onClick={generateImage}
          disabled={isLoading}>
          <div style={{ height: "50px" }} className="inner">
            <div className="svgs">
              <svg
                viewBox="0 0 256 256"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-l"
              >
                <path
                  d="M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15"
                  fill="currentColor"
                ></path>
              </svg>
              <svg
                viewBox="0 0 256 256"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                className="svg-s"
              >
                <path
                  d="M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            {isLoading ? "Generating..." : "Generate"}
          </div>
        </button>
      </div>

      {/* Download Button */}
      {imageUrl !== DEFAULT_IMAGE && (
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }} className="mt-8 flex gap-6">
  <button className="button" onClick={downloadImage} style={{ verticalAlign: "middle" }}>
    <svg
      height="24"
      width="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"></path>
    </svg>
    <span>Download</span>
  </button>

  <button className="button" onClick={shareImage} style={{ verticalAlign: "middle" }}>
    <svg
      height="24"
      width="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"></path>
    </svg>
    <span>Share</span>
  </button>
</div>

      )}

      {/* Footer Section */}
      <footer
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        className="mt-20 p-4 bg-gray-200 rounded-lg w-full text-center"
      >
        <pre className="text-gray-700" style={{ fontSize: "18px" }}>
          © 2024 AI Image Generator.All rights reserved.        Created By <span>M A K.dev</span>
        </pre>
      </footer>

    </div>
  );
};

export default ImageGen;
