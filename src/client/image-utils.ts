type CompressOptions = {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
};

const DEFAULT_OPTIONS: Required<CompressOptions> = {
	maxWidth: 1920,
	maxHeight: 1920,
	quality: 0.8,
};

export async function compressImage(
	file: File,
	options?: CompressOptions,
): Promise<File> {
	const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			let { width, height } = img;

			// Calculate new dimensions while maintaining aspect ratio
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width = Math.round(width * ratio);
				height = Math.round(height * ratio);
			}

			// Create canvas and draw resized image
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			// Convert to JPEG blob
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Failed to create blob"));
						return;
					}

					// Create new file with .jpg extension
					const fileName = `${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
					const compressedFile = new File([blob], fileName, {
						type: "image/jpeg",
						lastModified: Date.now(),
					});

					resolve(compressedFile);
				},
				"image/jpeg",
				quality,
			);
		};

		img.onerror = () => {
			reject(new Error("Failed to load image"));
		};

		// Load image from file
		const reader = new FileReader();
		reader.onload = (e) => {
			img.src = e.target?.result as string;
		};
		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};
		reader.readAsDataURL(file);
	});
}
