"use client";

import React from "react";
import { Accordion, AccordionItem } from "./Accordion";

export const AccordionExample: React.FC = () => {
  return (
    <div className="max-w-content mx-auto p-large space-y-xLarge">
      <h1 className="text-large text-text-dark">Accordion Examples</h1>

      {/* Basic Accordion */}
      <div>
        <h2 className="text-base-bold text-text-dark mb-small">
          Basic Accordion
        </h2>
        <Accordion>
          <AccordionItem title="What is Write Right?">
            <p className="text-base text-text-dark">
              Write Right is a platform that helps you improve your writing
              skills through AI-powered feedback and suggestions.
            </p>
          </AccordionItem>
          <AccordionItem title="How does it work?">
            <p className="text-base text-text-dark">
              Simply submit your text, and our AI will analyze it for grammar,
              style, clarity, and structure, providing actionable feedback.
            </p>
          </AccordionItem>
          <AccordionItem title="Is it free to use?">
            <p className="text-base text-text-dark">
              We offer both free and premium tiers. The free tier includes basic
              feedback, while premium offers advanced analysis and suggestions.
            </p>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Accordion with Multiple Open Items */}
      <div>
        <h2 className="text-base-bold text-text-dark mb-small">
          Multiple Items Open
        </h2>
        <Accordion spacing="xSmall" allowMultiple defaultOpen={[0]}>
          <AccordionItem title="Getting Started">
            <div className="space-y-small">
              <p className="text-base text-text-dark">
                To get started with Write Right:
              </p>
              <ol className="list-decimal list-inside text-base text-text-dark space-y-xSmall">
                <li>Create an account</li>
                <li>Submit your first text</li>
                <li>Review the feedback</li>
                <li>Apply the suggestions</li>
              </ol>
            </div>
          </AccordionItem>
          <AccordionItem title="Advanced Features">
            <p className="text-base text-text-dark">
              Advanced features include tone analysis, readability scoring, and
              personalized writing recommendations.
            </p>
          </AccordionItem>
          <AccordionItem title="Support">
            <p className="text-base text-text-dark">
              Need help? Contact our support team at support@writeright.com or
              check our comprehensive documentation.
            </p>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Accordion with Different Spacing */}
      <div>
        <h2 className="text-base-bold text-text-dark mb-small">
          Large Spacing
        </h2>
        <Accordion spacing="large">
          <AccordionItem title="Privacy Policy">
            <p className="text-base text-text-dark">
              Your privacy is important to us. We never share your writing with
              third parties and use industry-standard encryption.
            </p>
          </AccordionItem>
          <AccordionItem title="Terms of Service">
            <p className="text-base text-text-dark">
              By using Write Right, you agree to our terms of service. Please
              read them carefully.
            </p>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Accordion with No Spacing */}
      <div>
        <h2 className="text-base-bold text-text-dark mb-small">No Spacing</h2>
        <Accordion spacing="none">
          <AccordionItem title="Section 1">
            <p className="text-base text-text-dark">
              This is the first section with no spacing between items.
            </p>
          </AccordionItem>
          <AccordionItem title="Section 2">
            <p className="text-base text-text-dark">
              This is the second section, directly connected to the first.
            </p>
          </AccordionItem>
          <AccordionItem title="Section 3">
            <p className="text-base text-text-dark">
              This is the third section, creating a seamless connected look.
            </p>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Accordion with Custom Title Content */}
      <div>
        <h2 className="text-base-bold text-text-dark mb-small">
          Custom Title Content
        </h2>
        <Accordion spacing="small">
          <AccordionItem
            title={
              <div className="flex items-center gap-small">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-base-bold text-text-dark">
                  Active Feature
                </span>
              </div>
            }
          >
            <p className="text-base text-text-dark">
              This feature is currently active and working properly.
            </p>
          </AccordionItem>
          <AccordionItem
            title={
              <div className="flex items-center gap-small">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-base-bold text-text-dark">
                  In Development
                </span>
              </div>
            }
          >
            <p className="text-base text-text-dark">
              This feature is currently under development and will be available
              soon.
            </p>
          </AccordionItem>
          <AccordionItem
            title={
              <div className="flex items-center gap-small">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                <span className="text-base-bold text-text-light">
                  Disabled Feature
                </span>
              </div>
            }
            disabled
          >
            <p className="text-base text-text-dark">
              This feature is currently disabled.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
