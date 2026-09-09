#!/usr/bin/env python3
"""
Root-level entry point delegating to scripts/verify_document_analysis.py.
Allows running `python verify_document_analysis.py` directly from the workspace root.
"""
import sys
import runpy
from pathlib import Path

target_script = Path(__file__).resolve().parent / "scripts" / "verify_document_analysis.py"

if __name__ == "__main__":
    sys.argv[0] = str(target_script)
    runpy.run_path(str(target_script), run_name="__main__")
