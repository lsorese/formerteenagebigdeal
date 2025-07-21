#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Read album data
const albumData = JSON.parse(fs.readFileSync('./src/data/albumData.json', 'utf8'));

// Album metadata
const albumTitle = albumData.title;
const albumArtist = albumData.artist;
const releaseYear = albumData.releaseDate;
const genre = "Hardcore"; // As specified in requirements
const totalTracks = albumData.tracks.length;

console.log(`Updating ID3 tags for "${albumTitle}" by ${albumArtist}`);
console.log(`Release year: ${releaseYear}, Genre: ${genre}, Total tracks: ${totalTracks}\n`);

// Process each track
albumData.tracks.forEach((track) => {
  const trackNumber = track.id;
  const trackTitle = track.title;
  const mp3File = `./src${track.url}`;
  
  // Check if file exists
  if (!fs.existsSync(mp3File)) {
    console.log(`⚠️  File not found: ${mp3File}`);
    return;
  }

  console.log(`Processing Track ${trackNumber}: ${trackTitle}`);
  
  const tempFile = mp3File.replace('.mp3', '.tmp.mp3');
  
  try {
    // Build ffmpeg command to update ID3 tags
    const command = [
      'ffmpeg',
      '-i', `"${mp3File}"`,
      '-c', 'copy', // Copy without re-encoding
      '-metadata', `title="${trackTitle}"`,
      '-metadata', `artist="${albumArtist}"`,
      '-metadata', `album="${albumTitle}"`,
      '-metadata', `date="${releaseYear}"`,
      '-metadata', `genre="${genre}"`,
      '-metadata', `track="${trackNumber}/${totalTracks}"`,
      '-y', // Overwrite output file
      `"${tempFile}"`
    ].join(' ');

    // Execute ffmpeg command
    execSync(command, { stdio: 'pipe' });
    
    // Replace original file with updated version
    fs.renameSync(tempFile, mp3File);
    
    console.log(`✅ Updated: ${path.basename(mp3File)}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${mp3File}:`, error.message);
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
});

console.log('\n🎵 Processing FLAC files...\n');

// Process FLAC files
albumData.tracks.forEach((track) => {
  const trackNumber = track.id;
  const trackTitle = track.title;
  const flacFile = `./src/flac/${track.url.split('/').pop().replace('.mp3', '.flac')}`;
  
  // Check if file exists
  if (!fs.existsSync(flacFile)) {
    console.log(`⚠️  FLAC file not found: ${flacFile}`);
    return;
  }

  console.log(`Processing FLAC Track ${trackNumber}: ${trackTitle}`);
  
  const tempFile = flacFile.replace('.flac', '.tmp.flac');
  
  try {
    // Build ffmpeg command to update FLAC metadata
    const command = [
      'ffmpeg',
      '-i', `"${flacFile}"`,
      '-c', 'copy', // Copy without re-encoding
      '-metadata', `title="${trackTitle}"`,
      '-metadata', `artist="${albumArtist}"`,
      '-metadata', `album="${albumTitle}"`,
      '-metadata', `date="${releaseYear}"`,
      '-metadata', `genre="${genre}"`,
      '-metadata', `tracknumber="${trackNumber}"`,
      '-metadata', `tracktotal="${totalTracks}"`,
      '-y', // Overwrite output file
      `"${tempFile}"`
    ].join(' ');

    // Execute ffmpeg command
    execSync(command, { stdio: 'pipe' });
    
    // Replace original file with updated version
    fs.renameSync(tempFile, flacFile);
    
    console.log(`✅ Updated: ${path.basename(flacFile)}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${flacFile}:`, error.message);
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
});

console.log('\n✨ ID3 tag update process completed!');