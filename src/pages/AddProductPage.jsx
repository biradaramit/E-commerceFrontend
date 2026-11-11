import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  sku: "",
  categoryId: "",
  stockQuantity: "",
  imageUrl: ""
};

function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (form.price === "" || Number(form.price) <= 0) {
    errors.price = "Price must be greater than zero.";
  }

  if (!form.sku.trim()) {
    errors.sku = "SKU is required.";
  }

  if (!form.categoryId) {
    errors.categoryId = "Please select a category.";
  }

  if (form.stockQuantity === "" || Number(form.stockQuantity) < 0) {
    errors.stockQuantity = "Stock quantity cannot be negative.";
  }

  if (form.imageUrl.trim()) {
    try {
      const url = new URL(form.imageUrl.trim());

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.imageUrl = "Image URL must start with http:// or https://.";
      }
    } catch {
      errors.imageUrl = "Enter a valid image URL.";
    }
  }

  return errors;
}

function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const list = await productService.getCategories();

        if (active) {
          setCategories(list);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Could not load categories.");
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const errors = validate(form);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      await productService.createProduct(form);

      // Products page reloads its list on mount, so the new product appears.
      navigate("/", {
        replace: true,
        state: { message: `"${form.name.trim()}" was added to the catalog.` }
      });
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("You do not have permission to add products.");
      } else if (err.response?.status === 409) {
        setError(err.response.data?.message || "This SKU already exists.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Could not add the product. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/");
  }

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>Add Product</h1>
          <p className="page-subtitle">
            Create a new product in the catalog.
          </p>
        </div>

        <Link to="/" className="back-link">
          ← Back to Products
        </Link>
      </div>

      {success && <div className="message-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}

      <form className="checkout-form add-product-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Product Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
        />

        <label htmlFor="price">Price *</label>
        <input
          id="price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.price)}
        />
        {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}

        <label htmlFor="sku">SKU *</label>
        <input
          id="sku"
          name="sku"
          type="text"
          value={form.sku}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.sku)}
        />
        {fieldErrors.sku && <p className="field-error">{fieldErrors.sku}</p>}

        <label htmlFor="categoryId">Category *</label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          disabled={loadingCategories}
          aria-invalid={Boolean(fieldErrors.categoryId)}
        >
          <option value="">
            {loadingCategories ? "Loading categories..." : "Select a category"}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId && (
          <p className="field-error">{fieldErrors.categoryId}</p>
        )}

        <label htmlFor="stockQuantity">Stock Quantity *</label>
        <input
          id="stockQuantity"
          name="stockQuantity"
          type="number"
          min="0"
          step="1"
          value={form.stockQuantity}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.stockQuantity)}
        />
        {fieldErrors.stockQuantity && (
          <p className="field-error">{fieldErrors.stockQuantity}</p>
        )}

        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={form.imageUrl}
          onChange={handleChange}
          aria-invalid={Boolean(fieldErrors.imageUrl)}
        />
        {fieldErrors.imageUrl && (
          <p className="field-error">{fieldErrors.imageUrl}</p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={submitting || loadingCategories}
          >
            {submitting ? "Adding product..." : "Add Product"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddProductPage;
