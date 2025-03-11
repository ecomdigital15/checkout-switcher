import React, { useState,useCallback } from 'react';
import { Form, TextField, Modal, Banner, List, DropZone, Stack, Text, Button } from '@shopify/polaris';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function AddIconModal({ onAddIcon, onClose }) {
  const [title, setTitle] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const fetch = useAuthenticatedFetch();
  const [loading,setLoading] = useState(false);
  // const [iconFile, setIconFile] = useState<File | null>(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);

  const handleDrop = useCallback(
    (_droppedFiles, acceptedFiles, rejectedFiles) => {
      const selectedImage = acceptedFiles[0];
      if (selectedImage) {
        const img = new Image();
        img.src = URL.createObjectURL(selectedImage);
        img.onload = function () {
          if (img.width > 50 || img.height > 50) {
            console.log("Greater width")
      //       setRejectedFiles(acceptedFiles[0]);   
      //     } else {
      //       // Valid image, continue with your logic
      //       setIconFile(acceptedFiles[0] || null);
            setIconFile(acceptedFiles[0] || null);
            setRejectedFiles(rejectedFiles);
          }else{
            setIconFile(acceptedFiles[0] || null);
            setRejectedFiles(rejectedFiles);
          }
        };
      }
      // console.log(acceptedFiles)
      // setIconFile(acceptedFiles[0] || null);
      // setRejectedFiles(rejectedFiles);
    },
    [],
  );


  const errorMessage = rejectedFiles.length > 0 && (
    <Banner title="The following images couldn’t be uploaded:" status="critical">
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File size must be 50x50 and File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  const handleSubmit = async () => {
    setLoading(true)
    // Validate form fields
    if (!title || !iconFile) {
      // Handle validation error
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('icon', iconFile);

    // Send the FormData to the server
    const response = await fetch('/api/upload-icon', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData)
    }

    onAddIcon({ title, iconFile });
    setTitle('');
    setIconFile(null);
    onClose();
    setLoading(false)
  };

  return (
    <Modal.Section>
      <Form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <DropZone accept="image/*" allowMultiple={false} type="image" onDrop={handleDrop}>
            {iconFile && (
              <Stack vertical>
                <img
                  src={window.URL.createObjectURL(iconFile)}
                  alt={iconFile.name}
                  width="50"
                  height="50"
                />
                <Text variant="body">{iconFile.name}</Text>
              </Stack>
            )}
            {!iconFile && <DropZone.FileUpload />}
          </DropZone>
          {errorMessage}
          <Button submit loading={loading}>Submit</Button>
      </Form>
    </Modal.Section>
  );
}
