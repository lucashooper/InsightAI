export const downloadNoteAsTxt = (note: { title: string; content: string; created_at: string }) => {
  // Create the content for the text file
  const content = `${note.title || 'Untitled'}

Created: ${new Date(note.created_at).toLocaleString()}

${note.content || ''}`;

  // Create a blob with the content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Create a safe filename (remove special characters)
  const safeTitle = (note.title || 'Untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = new Date(note.created_at).toISOString().split('T')[0];
  link.download = `${safeTitle}_${date}.txt`;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};