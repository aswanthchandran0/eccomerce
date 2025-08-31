async function ajaxRequest(url, method = "GET", data = null, isFormData = false) {
  try {
    let options = {
      method,
    };

      if (data) {
      if (isFormData) {
        // For FormData (file uploads), do not set Content-Type manually
        options.body = data;
      } else {
        // For normal JSON requests
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(data);
      }
    }
    const response = await fetch(url, options);
    const result = await response.json();
    console.log("result in ajax",result)
    if (!response.ok) {
      // return whole object, not just message
      return {
        success: false,
        message: result.message || "Something went wrong",
        errors: result.errors || null
      };
    }

    return result; // success response
  } catch (error) {
    return { success: false, message: error.message, errors: null };
  }


}



  