"use client"

import { useState } from "react"
import { kumiteRuleExplainer } from "@/ai/flows/kumite-rule-explainer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, MessageSquare, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RuleExplainer() {
  const [question, setQuestion] = useState("")
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setIsLoading(true)
    try {
      const res = await kumiteRuleExplainer({ question })
      setExplanation(res.explanation)
    } catch (err) {
      setExplanation("Sorry, I encountered an error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-secondary/40 border-border/50 backdrop-blur-md overflow-hidden">
      <CardHeader className="border-b border-border/20 bg-primary/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Rule Explainer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Ask about a rule (e.g., 'When is Ippon awarded?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-background/50 border-border/50 resize-none min-h-[100px] focus-visible:ring-accent"
            />
            <Button
              size="sm"
              className="absolute bottom-2 right-2 bg-accent hover:bg-accent/80"
              onClick={handleAsk}
              disabled={isLoading || !question}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explain"}
            </Button>
          </div>

          {explanation && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              <ScrollArea className="h-[150px] w-full rounded-md border border-border/20 p-4 bg-background/30">
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-accent shrink-0 mt-1" />
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap italic">
                    {explanation}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}