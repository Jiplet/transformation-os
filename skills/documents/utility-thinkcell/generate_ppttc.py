#!/usr/bin/env python3
"""
generate_ppttc.py — Generate a think-cell .ppttc data file from a template and JSON data.

Usage:
    python3 generate_ppttc.py --template path/to/template.pptx --output out.ppttc --data '<json>'
    python3 generate_ppttc.py --template path/to/template.pptx --output out.ppttc --data path/to/data.json
"""

import argparse
import json
import os
import sys


def load_data(data_arg: str) -> dict:
    """Load data from a JSON string or a file path."""
    if os.path.exists(data_arg):
        with open(data_arg, "r", encoding="utf-8") as f:
            return json.load(f)
    try:
        return json.loads(data_arg)
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not parse --data as JSON: {e}", file=sys.stderr)
        print("  Pass either a valid JSON string or a path to a .json file.", file=sys.stderr)
        sys.exit(1)


def apply_element(tc, template_name: str, element: dict):
    """Apply a single element (chart, text, or harvey_ball) to the thinkcell object."""
    name = element.get("name")
    etype = element.get("type", "").lower()

    if not name:
        print(f"WARNING: Element missing 'name' field — skipping: {element}", file=sys.stderr)
        return

    if etype == "chart":
        categories = element.get("categories", [])
        data = element.get("data", [])
        if not data:
            print(f"WARNING: Chart element '{name}' has no data rows — skipping.", file=sys.stderr)
            return
        try:
            tc.add_chart(template_name, name, categories, data)
        except Exception as e:
            print(f"ERROR: Failed to add chart '{name}': {e}", file=sys.stderr)
            print("  Check that element name matches the placeholder in the template.", file=sys.stderr)
            raise

    elif etype == "text":
        value = element.get("value", "")
        try:
            tc.add_textfield(template_name, name, str(value))
        except Exception as e:
            print(f"ERROR: Failed to add text field '{name}': {e}", file=sys.stderr)
            raise

    elif etype == "harvey_ball":
        value = element.get("value", 0)
        try:
            # Harvey balls are treated as numeric text fields in thinkcell
            tc.add_textfield(template_name, name, str(value))
        except Exception as e:
            print(f"ERROR: Failed to add Harvey ball field '{name}': {e}", file=sys.stderr)
            raise

    else:
        print(f"WARNING: Unknown element type '{etype}' for '{name}' — skipping.", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Generate a think-cell .ppttc file from a .pptx template and JSON data."
    )
    parser.add_argument(
        "--template",
        required=True,
        help="Path to the .pptx template file containing think-cell placeholders.",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Output path for the .ppttc file (e.g. Projects/myproject/chart.ppttc).",
    )
    parser.add_argument(
        "--data",
        required=True,
        help='JSON string or path to .json file. Structure: {"elements": [...]}',
    )
    args = parser.parse_args()

    # Validate template path
    if not os.path.exists(args.template):
        print(f"ERROR: Template file not found: {args.template}", file=sys.stderr)
        print("  Provide a valid .pptx path, or register the template first with register_template.py", file=sys.stderr)
        sys.exit(1)

    # Load data
    payload = load_data(args.data)

    elements = payload.get("elements")
    if not elements:
        print("ERROR: Data JSON must contain an 'elements' key with a list of chart/text elements.", file=sys.stderr)
        sys.exit(1)

    # Import thinkcell
    try:
        import thinkcell as tc_module
    except ImportError:
        print("ERROR: thinkcell package not installed.", file=sys.stderr)
        print("  Run: pip install thinkcell", file=sys.stderr)
        sys.exit(1)

    # Build the ppttc
    # thinkcell API: add_template(template_name) registers the .pptx path as the key.
    # add_chart/add_textfield take (template_name, element_name, ...) — template_name
    # must be the exact same string passed to add_template (the .pptx path/filename).
    template_name = args.template

    try:
        tc = tc_module.Thinkcell()
        tc.add_template(args.template)
    except Exception as e:
        print(f"ERROR: Failed to load template '{args.template}': {e}", file=sys.stderr)
        sys.exit(1)

    for element in elements:
        apply_element(tc, template_name, element)

    # Ensure output directory exists
    output_dir = os.path.dirname(os.path.abspath(args.output))
    os.makedirs(output_dir, exist_ok=True)

    try:
        tc.save_ppttc(args.output)
    except Exception as e:
        print(f"ERROR: Failed to save .ppttc to '{args.output}': {e}", file=sys.stderr)
        sys.exit(1)

    print(f"OK: .ppttc saved to {args.output}")
    print(f"    Double-click {os.path.basename(args.output)} to render in PowerPoint with think-cell.")


if __name__ == "__main__":
    main()
