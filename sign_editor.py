from PIL import Image, ImageDraw, ImageFont, ImageOps
import numpy as np
from PIL import ImageFilter, ImageEnhance
import math
import random

def generate_sign(text_lines, input_file="photo.jpg", output_file="output.png"):
    """
    Generate a custom club sign by adding text directly to the sign with illuminated letter effect.
    
    Args:
        text_lines (list): List of text lines to add to the sign (up to 3 lines)
        input_file (str): Path to the input image file
        output_file (str): Path to save the output image
    """
    # Fixed parameters (no longer user-adjustable)
    font_size = 40
    glow_intensity = 40
    outline_width = 2
    letter_spacing = 3
    
    # Load the base image
    try:
        base = Image.open(input_file).convert("RGBA")
    except FileNotFoundError:
        print(f"❌ Error: Could not find input file '{input_file}'")
        return
    except Exception as e:
        print(f"❌ Error loading image: {e}")
        return
    
    # Make a copy of the base
    img = base.copy()
    width, height = img.size
    
    # Update the sign structure with more precise section positioning
    # Move first and last words much closer to the middle word
    sign_structure = {
        # Main display area with grid sections - moved higher with much tighter spacing
        "grid": {
            "y": height * 0.35,  # Start position moved higher
            "height": height * 0.25,  # Height reduced for tighter spacing
            # Define the horizontal boundaries to ensure text stays within white area
            "x": width * 0.1,  # 10% from left edge
            "width": width * 0.8,  # 80% of image width
            "textColor": (17, 17, 17, 153),  # Even darker gray with transparency (60% opacity)
            "font_size": font_size,
            # Define the three horizontal sections with extremely tight spacing and adjusted vertical spacing
            "sections": [
                {"y": height * 0.435, "height": height * 0.07},  # Top section - moved much closer to middle
                {"y": height * 0.46, "height": height * 0.07},  # Middle section - kept at same position
                {"y": height * 0.485, "height": height * 0.07},  # Bottom section - moved much closer to middle
            ],
        }
    }
    
    # Try to load Arial Bold font, fall back to default if not available
    try:
        grid_font = ImageFont.truetype("arialbd.ttf", size=sign_structure["grid"]["font_size"])
    except IOError:
        try:
            # Try system fonts on different platforms
            grid_font = ImageFont.truetype("Arial Bold.ttf", size=sign_structure["grid"]["font_size"])
        except IOError:
            try:
                grid_font = ImageFont.truetype("/usr/share/fonts/truetype/freefont/FreeSansBold.ttf", size=sign_structure["grid"]["font_size"])
            except IOError:
                print("⚠️ Warning: Could not load Arial Bold font, using default")
                grid_font = ImageFont.load_default()
    
    # Prepare text for the grid sections
    grid_words = []
    
    # If text_lines is a string, split it into words
    if isinstance(text_lines, str):
        words = text_lines.split()
    else:
        # Flatten the list of lines into a list of words
        words = []
        for line in text_lines:
            words.extend(line.split())
    
    if len(words) <= 3:
        # If 3 or fewer words, each word gets its own row
        grid_words = [word.upper() for word in words]
        # Pad with empty strings if less than 3 words
        while len(grid_words) < 3:
            grid_words.append("")
    else:
        # If more than 3 words, distribute them across 3 rows
        words_per_row = (len(words) + 2) // 3  # Ceiling division
        for i in range(3):
            start_idx = i * words_per_row
            end_idx = min(start_idx + words_per_row, len(words))
            if start_idx < len(words):
                row_words = words[start_idx:end_idx]
                grid_words.append(" ".join(row_words).upper())
            else:
                grid_words.append("")
    
    # Create a draw object
    draw = ImageDraw.Draw(img)
    
    # Create a transparent overlay for the glow effect
    glow_overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_overlay)
    
    # Define rotation angle (3 degrees) for a more noticeable tilt to the right
    rotation_angle = 3  # 3 degrees
    
    # Draw each word in its designated section
    for i in range(len(sign_structure["grid"]["sections"])):
        section = sign_structure["grid"]["sections"][i]
        word = grid_words[i] if i < len(grid_words) else ""
        
        if not word:
            continue  # Skip empty sections
        
        # Calculate the center of the section
        section_center_y = section["y"] + section["height"] / 2
        
        # Calculate text width to center the word
        word_width = draw.textsize(word, font=grid_font)[0]
        
        # Draw the word in the center of its section
        letters = word
        
        # Calculate letter widths and total width
        letter_widths = []
        total_letter_width = 0
        
        # First pass: measure each letter
        for letter in letters:
            if letter.strip() == "":
                # Handle spaces
                space_width = draw.textsize(" ", font=grid_font)[0]
                letter_widths.append(space_width)
                total_letter_width += space_width
            else:
                width, _ = draw.textsize(letter, font=grid_font)
                letter_widths.append(width)
                total_letter_width += width
        
        # Calculate total width with spacing
        # Only add spacing between letters, not after the last letter
        total_width = total_letter_width + (len(letters.replace(" ", "")) - 1) * letter_spacing

        # Ensure text stays within the horizontal boundaries
        max_width = sign_structure["grid"]["width"]
        if total_width > max_width * 0.95:
            # Scale down font size more aggressively to ensure text fits well
            scale_factor = (max_width * 0.95) / total_width
            adjusted_font_size = int(sign_structure["grid"]["font_size"] * scale_factor)
            try:
                grid_font = ImageFont.truetype("arialbd.ttf", size=adjusted_font_size)
            except:
                # Fallback if font loading fails
                grid_font = ImageFont.load_default()
            
            # Recalculate letter widths with new font size
            letter_widths = []
            total_letter_width = 0
            for letter in letters:
                if letter.strip() == "":
                    # Handle spaces
                    space_width = draw.textsize(" ", font=grid_font)[0]
                    letter_widths.append(space_width)
                    total_letter_width += space_width
                else:
                    width, _ = draw.textsize(letter, font=grid_font)
                    letter_widths.append(width)
                    total_letter_width += width
            
            # Recalculate total width
            total_width = total_letter_width + (len(letters.replace(" ", "")) - 1) * letter_spacing

        # Calculate starting position ensuring there's at least 2px margin on each side
        left_boundary = sign_structure["grid"]["x"]
        right_boundary = sign_structure["grid"]["x"] + sign_structure["grid"]["width"]
        current_x = (width - total_width) / 2
        # Add a larger offset to move text more to the right
        current_x += 35  # 35px offset to the right

        if current_x < left_boundary:
            current_x = left_boundary + 2  # Add 2px margin
        if current_x + total_width > right_boundary:
            current_x = right_boundary - total_width - 2  # Add 2px margin
        
        letter_index = 0
        for letter in letters:
            if letter.strip() == "":
                # Handle spaces
                current_x += letter_widths[letter_index] + letter_spacing
                letter_index += 1
                continue
            
            letter_width = letter_widths[letter_index]
            letter_height = sign_structure["grid"]["font_size"] * 0.8
            
            # Draw transparent box with dim grayish outline for each letter
            padding = 4  # Padding around the letter
            extra_height_top = 16  # Significantly more height at the top
            extra_height_bottom = 2  # Small extra height at the bottom
            
            # Create a rotated rectangle for the box outline
            # Calculate the four corners of the rectangle
            box_left = current_x - padding/2
            box_top = section_center_y - letter_height/2 - padding/2 - extra_height_top
            box_right = current_x + letter_width + padding/2
            box_bottom = section_center_y + letter_height/2 + padding/2 + extra_height_bottom
            
            # Calculate the center of the box for rotation
            box_center_x = (box_left + box_right) / 2
            box_center_y = (box_top + box_bottom) / 2
            
            # Calculate the rotated corners
            cos_angle = math.cos(math.radians(rotation_angle))
            sin_angle = math.sin(math.radians(rotation_angle))
            
            # Function to rotate a point around a center
            def rotate_point(x, y, center_x, center_y, cos_a, sin_a):
                dx = x - center_x
                dy = y - center_y
                new_x = center_x + dx * cos_a - dy * sin_a
                new_y = center_y + dx * sin_a + dy * cos_a
                return new_x, new_y
            
            # Get the rotated corners
            top_left = rotate_point(box_left, box_top, box_center_x, box_center_y, cos_angle, sin_angle)
            top_right = rotate_point(box_right, box_top, box_center_x, box_center_y, cos_angle, sin_angle)
            bottom_right = rotate_point(box_right, box_bottom, box_center_x, box_center_y, cos_angle, sin_angle)
            bottom_left = rotate_point(box_left, box_bottom, box_center_x, box_center_y, cos_angle, sin_angle)
            
            # Draw the rotated rectangle outline
            draw.line([top_left, top_right, bottom_right, bottom_left, top_left], 
                      fill=(150, 150, 150, 38), width=outline_width)
            
            # Draw the glow behind each letter
            # Create a separate small image for the glow
            glow_size = int(max(letter_width, letter_height) * 1.5)
            letter_glow = Image.new('RGBA', (glow_size, glow_size), (0, 0, 0, 0))
            letter_glow_draw = ImageDraw.Draw(letter_glow)
            
            # Draw the letter in the center of the glow image
            letter_glow_draw.text(
                (glow_size // 2 - letter_width // 2, glow_size // 2 - letter_height // 2),
                letter,
                font=grid_font,
                fill=(255, 255, 255, int(255 * glow_intensity / 100))
            )
            
            # Apply blur to create the glow
            letter_glow = letter_glow.filter(ImageFilter.GaussianBlur(radius=font_size / 10))
            
            # Paste the glow onto the glow overlay
            glow_x = int(current_x - (glow_size - letter_width) / 2)
            glow_y = int(section_center_y - letter_height / 2 - (glow_size - letter_height) / 2 - 1)  # Shifted up by 1px
            glow_overlay.paste(letter_glow, (glow_x, glow_y), letter_glow)
            
            # Create a small image for the rotated and vertically stretched text
            text_img = Image.new('RGBA', (int(letter_width * 1.5), int(letter_height * 1.8)), (0, 0, 0, 0))
            text_draw = ImageDraw.Draw(text_img)
            
            # Add letter flaws/texture with more variation
            flaw_intensity = 0.4  # Increased from 0.3 for more noticeable flaws
            # Add slight random variations to letter position
            offset_x = int((random.random() - 0.5) * 2 * flaw_intensity * letter_width * 0.1)
            offset_y = int((random.random() - 0.5) * 2 * flaw_intensity * letter_height * 0.1)
            # Add slight random variations to letter opacity
            opacity_variation = 0.85 + (random.random() * 0.3)
            opacity = int(153 * opacity_variation)
            
            # Random size variation for some letters (±5%)
            size_variation = 0.95 + random.random() * 0.1
            
            # Draw the letter with random variations and vertical stretching
            # Calculate the center position for the letter
            center_x = text_img.width // 2
            center_y = text_img.height // 2
            
            # Create a stretched version of the letter
            stretched_letter_img = Image.new('RGBA', (int(letter_width * 1.2), int(letter_height * 1.8)), (0, 0, 0, 0))
            stretched_letter_draw = ImageDraw.Draw(stretched_letter_img)
            
            # Create a gradient effect for 3D appearance
            gradient_img = Image.new('RGBA', (int(letter_width * 1.2), int(letter_height * 1.8)), (0, 0, 0, 0))
            gradient_draw = ImageDraw.Draw(gradient_img)

            # Draw the letter three times with different colors to create subtle gradient effect
            # Top part (slightly lighter)
            gradient_draw.text(
                (gradient_img.width // 2 - letter_width // 2 + offset_x, 
                 gradient_img.height // 2 - letter_height // 2 + offset_y - 1),
                letter,
                font=grid_font,
                fill=(24, 24, 24, opacity)  # Very slightly lighter shade for top
            )

            # Middle part
            gradient_draw.text(
                (gradient_img.width // 2 - letter_width // 2 + offset_x, 
                 gradient_img.height // 2 - letter_height // 2 + offset_y),
                letter,
                font=grid_font,
                fill=(22, 22, 22, opacity)  # Middle shade
            )

            # Bottom part (slightly darker)
            gradient_draw.text(
                (gradient_img.width // 2 - letter_width // 2 + offset_x, 
                 gradient_img.height // 2 - letter_height // 2 + offset_y + 1),
                letter,
                font=grid_font,
                fill=(20, 20, 20, opacity)  # Very slightly darker shade for bottom
            )

            # Use the gradient image instead of the simple text
            stretched_letter_img = gradient_img
            
            # Resize the image to stretch it vertically but maintain width
            stretched_letter_img = stretched_letter_img.resize(
                (int(letter_width * size_variation), 
                 int(letter_height * 1.4 * size_variation)),  # 40% taller
                Image.LANCZOS
            )
            
            # Rotate the stretched letter
            rotated_letter = stretched_letter_img.rotate(rotation_angle, resample=Image.BICUBIC, expand=False)
            
            # Paste the rotated letter onto the text image
            text_img.paste(rotated_letter, 
                          (center_x - rotated_letter.width // 2, 
                           center_y - rotated_letter.height // 2), 
                          rotated_letter)
            
            # Add a gleaming spot to random letters (1 in 4 chance)
            if random.random() < 0.25:
                # Create a small image for the gleam
                gleam_size = int(letter_width * 0.5)
                gleam_img = Image.new('RGBA', (gleam_size, gleam_size), (0, 0, 0, 0))
                gleam_draw = ImageDraw.Draw(gleam_img)
                
                # Position for the gleam (usually top-right of the letter)
                gleam_x = int(gleam_size * (0.3 + random.random() * 0.4))
                gleam_y = int(gleam_size * (0.3 + random.random() * 0.4))
                gleam_radius = int(gleam_size * (0.1 + random.random() * 0.15))
                
                # Draw a radial gradient for the gleam
                for r in range(gleam_radius, 0, -1):
                    opacity = int(200 * (1 - r / gleam_radius))
                    gleam_draw.ellipse(
                        (gleam_x - r, gleam_y - r, gleam_x + r, gleam_y + r),
                        fill=(255, 255, 255, opacity)
                    )
                
                # Paste the gleam onto the text image
                text_img.paste(gleam_img, 
                              (center_x + int(letter_width * 0.2), 
                               center_y - int(letter_height * 0.3)), 
                              gleam_img)
            
            # Paste the final text image onto the main image
            text_paste_x = int(current_x - (text_img.width - letter_width) // 2)
            text_paste_y = int(section_center_y - letter_height / 2 - (text_img.height - letter_height) // 2 - 1)
            img.paste(text_img, (text_paste_x, text_paste_y), text_img)
            
            # Move to the next letter position with additional spacing
            current_x += letter_width + letter_spacing
            letter_index += 1
    
    # Composite the glow overlay with the main image
    img = Image.alpha_composite(img, glow_overlay)
    
    # Convert back to RGB for saving as JPEG if needed
    if output_file.lower().endswith(('.jpg', '.jpeg')):
        img = img.convert('RGB')
    
    # Save the result
    img.save(output_file)
    print(f"✅ Saved: {output_file}")
    return output_file

if __name__ == "__main__":
    print("🔧 Club Sign Text Editor 🔧")
    print("---------------------------")
    
    # Get input from user
    print("Enter the text for your sign (max 20 characters):")
    
    text = input("Text: ")
    # Enforce character limit
    if len(text) > 20:
        print(f"⚠️ Text too long ({len(text)} chars). Truncating to 20 characters.")
        text = text[:20]
    
    if not text:
        print("❌ No text entered. Exiting.")
    else:
        # Generate the sign with fixed parameters
        generate_sign(text)
        print("\n✨ All done! Check the output.png file for your custom sign.")
